import { MedusaContainer } from "@medusajs/framework";
import {
    ContainerRegistrationKeys,
    ModuleRegistrationName,
    Modules,
} from "@medusajs/framework/utils";
import {
    batchVariantImagesWorkflow,
    createCollectionsWorkflow,
    createDefaultsWorkflow,
    createProductCategoriesWorkflow,
    createProductsWorkflow,
    createRegionsWorkflow,
    createShippingOptionsWorkflow,
    createShippingProfilesWorkflow,
    createStockLocationsWorkflow,
    createTaxRegionsWorkflow,
    linkProductsToSalesChannelWorkflow,
    linkSalesChannelsToStockLocationWorkflow,
    updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { CreateProductCategoryDTO, CreateProductCollectionDTO } from "@medusajs/types";

// ============================================================
// Embrace Nutrition – Probiotic Fizzy Drinks
// Products sourced from https://www.embracenutrition.in/
// Currency: INR (Indian Rupee) – default
// ============================================================


export default async function migration_25022026_initial_seed({
    container,
}: {
    container: MedusaContainer;
}) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const storeModuleService = container.resolve(ModuleRegistrationName.STORE);
    const salesChannelModuleService = container.resolve(ModuleRegistrationName.SALES_CHANNEL);
    const fulfillmentModuleService = container.resolve(
        ModuleRegistrationName.FULFILLMENT
    );

    const { data: existingProductsAtStartup } = await query.graph({
        entity: "product",
        fields: ["id"],
    });

    // If we want to explicitly not seed data, or if it's an existing project with data seeded in a different way, skip the seeding.
    if (process.env.SKIP_INITIAL_SEED === "true" || existingProductsAtStartup.length > 0) {
        return
    }

    logger.info("Seeding defaults...");
    await createDefaultsWorkflow(container).run();

    const [store] = await storeModuleService.listStores();
    let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    });


    await updateStoresWorkflow(container).run({
        input: {
            selector: { id: store.id },
            update: {
                supported_currencies: [
                    { currency_code: "inr", is_default: true },
                    { currency_code: "usd" },
                    { currency_code: "eur", is_tax_inclusive: true },
                    { currency_code: "gbp", is_tax_inclusive: true },
                ],
                default_sales_channel_id: defaultSalesChannel[0].id,
            },
        },
    });

    const { data: existingRegions } = await query.graph({
        entity: "region",
        fields: ["id", "name"],
    });

    if (!existingRegions.length) {
        logger.info("Creating regions...");
        await createRegionsWorkflow(container).run(
            {
                input: {
                    regions: [
                        {
                            name: "India",
                            currency_code: "inr",
                            countries: ["in"],
                            payment_providers: ["pp_system_default", "pp_razorpay_razorpay"],
                            automatic_taxes: false,
                            is_tax_inclusive: false,
                        },
                        {
                            name: "United States",
                            currency_code: "usd",
                            countries: ["us"],
                            payment_providers: ["pp_system_default"],
                            automatic_taxes: false,
                            is_tax_inclusive: false,
                        },
                        {
                            name: "Europe",
                            currency_code: "eur",
                            countries: ["de", "se", "fr", "es", "it"],
                            payment_providers: ["pp_system_default"],
                            automatic_taxes: true,
                            is_tax_inclusive: true,
                        },
                        {
                            name: "United Kingdom",
                            currency_code: "gbp",
                            countries: ["gb"],
                            payment_providers: ["pp_system_default"],
                            automatic_taxes: true,
                            is_tax_inclusive: true,
                        },
                    ],
                },
            }
        );
    } else {
        logger.info("Regions already exist, skipping creation...");
    }

    const { data: existingTaxRegions } = await query.graph({
        entity: "tax_region",
        fields: ["id", "name"],
    });

    if (!existingTaxRegions.length) {
        logger.info("Seeding tax regions...");
        const taxRates: Record<string, { rate: number; code: string; name: string }> =
        {
            gb: { rate: 20, code: "GB20", name: "UK VAT" },
            de: { rate: 19, code: "DE19", name: "Germany VAT" },
            se: { rate: 25, code: "SE25", name: "Sweden VAT" },
            fr: { rate: 20, code: "FR20", name: "France VAT" },
            es: { rate: 21, code: "ES21", name: "Spain VAT" },
            it: { rate: 22, code: "IT22", name: "Italy VAT" },
        };

        await createTaxRegionsWorkflow(container).run({
            input: Object.entries(taxRates).map(([country_code, taxConfig]) => {
                return {
                    country_code,
                    provider_id: "tp_system",
                    default_tax_rate: {
                        rate: taxConfig.rate,
                        code: taxConfig.code,
                        name: taxConfig.name,
                        is_default: true,
                    },
                };
            }),
        });

        logger.info("Finished seeding tax regions.");
    } else {
        logger.info("Tax regions already exist, skipping creation...");
    }


    const { data: existingStockLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id", "name"],
    });

    let stockLocation;
    if (!existingStockLocations.length) {
        logger.info("Seeding stock location data...");
        const { result: stockLocationResult } = await createStockLocationsWorkflow(
            container
        ).run({
            input: {
                locations: [
                    {
                        name: "Main Warehouse",
                        address: {
                            city: "Bangalore",
                            country_code: "IN",
                            address_1: "Embrace Nutrition HQ",
                        },
                    },
                ],
            },
        });
        stockLocation = stockLocationResult[0];

        await link.create({
            [Modules.STOCK_LOCATION]: {
                stock_location_id: stockLocation.id,
            },
            [Modules.FULFILLMENT]: {
                fulfillment_provider_id: "manual_manual",
            },
        });
    } else {
        logger.info("Stock location already exists, skipping creation...");
        stockLocation = existingStockLocations[0];
    }


    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
        type: "default",
    });
    let shippingProfile;

    if (!shippingProfiles.length) {
        logger.info("Creating shipping profile...");
        const { result: shippingProfileResult } =
            await createShippingProfilesWorkflow(container).run({
                input: {
                    data: [
                        {
                            name: "Default Shipping Profile",
                            type: "default",
                        },
                    ],
                },
            });
        shippingProfile = shippingProfileResult[0];
    } else {
        logger.info("Shipping profile already exists, skipping creation...");
        shippingProfile = shippingProfiles[0];
    }

    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets();

    let fulfillmentSet;
    if (!fulfillmentSets.length) {
        logger.info("Creating fulfillment set...");
        fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
            name: "Main Warehouse Delivery",
            type: "shipping",
            service_zones: [
                {
                    name: "Worldwide",
                    geo_zones: ["in", "us", "de", "se", "fr", "es", "it", "gb"].map(
                        (country_code) => ({ type: "country" as const, country_code })
                    ),
                },
            ],
        });

        await link.create({
            [Modules.STOCK_LOCATION]: {
                stock_location_id: stockLocation.id,
            },
            [Modules.FULFILLMENT]: {
                fulfillment_set_id: fulfillmentSet.id,
            },
        });
    } else {
        logger.info("Fulfillment set already exists, skipping creation...");
        fulfillmentSet = fulfillmentSets[0];
    }


    const { data: existingShippingOptions } = await query.graph({
        entity: "shipping_option",
        fields: ["id", "name"],
    });

    if (!existingShippingOptions.length) {
        logger.info("Creating shipping option...");
        await createShippingOptionsWorkflow(container).run({
            input: [
                {
                    name: "Standard Worldwide Shipping",
                    price_type: "flat",
                    provider_id: "manual_manual",
                    service_zone_id: fulfillmentSet.service_zones[0].id,
                    shipping_profile_id: shippingProfile.id,
                    type: {
                        label: "Standard",
                        description: "Ships worldwide",
                        code: "standard-worldwide",
                    },
                    prices: [
                        {
                            currency_code: "inr",
                            amount: 0,
                        },
                        {
                            currency_code: "usd",
                            amount: 0,
                        },
                        {
                            currency_code: "eur",
                            amount: 0,
                        },
                        {
                            currency_code: "gbp",
                            amount: 0,
                        },
                    ],
                    rules: [
                        {
                            attribute: "enabled_in_store",
                            value: "true",
                            operator: "eq",
                        },
                        {
                            attribute: "is_return",
                            value: "false",
                            operator: "eq",
                        },
                    ],
                },
            ],
        });
    } else {
        logger.info("Shipping option already exists, skipping creation...");
    }

    await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: {
            id: stockLocation.id,
            add: [defaultSalesChannel[0].id],
        },
    });

    // Seed product categories with nesting
    const { data: existingCategories } = await query.graph({
        entity: "product_category",
        fields: ["id", "handle", "name"],
    });

    const categoryHandles = existingCategories.map((c: any) => c.handle);
    const categoriesToCreate: CreateProductCategoryDTO[] = [];

    // Parent category
    if (!categoryHandles.includes("beverages")) {
        categoriesToCreate.push({
            name: "Beverages",
            handle: "beverages",
            is_active: true,
            is_internal: false,
        });
    }

    if (categoriesToCreate.length > 0) {
        logger.info("Seeding product categories...");
        await createProductCategoriesWorkflow(container).run({
            input: {
                product_categories: categoriesToCreate,
            },
        });
    } else {
        logger.info("Product categories already exist, skipping creation...");
    }

    // Get updated categories including newly created ones
    const { data: allCategories } = await query.graph({
        entity: "product_category",
        fields: ["id", "handle", "name"],
    });

    // Create a map for easy lookup
    const categoryMap: Record<string, any> = {};
    allCategories.forEach((cat: any) => {
        categoryMap[cat.handle] = cat;
    });

    // Create nested categories (children)
    const nestedCategoriesToCreate: CreateProductCategoryDTO[] = [];

    // Under Beverages
    if (!categoryHandles.includes("probiotic-drinks") && categoryMap["beverages"]) {
        nestedCategoriesToCreate.push({
            name: "Probiotic Drinks",
            handle: "probiotic-drinks",
            is_active: true,
            is_internal: false,
            parent_category_id: categoryMap["beverages"].id,
        });
    }
    if (!categoryHandles.includes("variety-packs") && categoryMap["beverages"]) {
        nestedCategoriesToCreate.push({
            name: "Variety Packs",
            handle: "variety-packs",
            is_active: true,
            is_internal: false,
            parent_category_id: categoryMap["beverages"].id,
        });
    }

    if (nestedCategoriesToCreate.length > 0) {
        logger.info("Creating nested product categories...");
        await createProductCategoriesWorkflow(container).run({
            input: {
                product_categories: nestedCategoriesToCreate,
            },
        });
    } else {
        logger.info("Nested product categories already exist, skipping creation...");
    }

    // Refresh categories after nesting
    const { data: finalCategories } = await query.graph({
        entity: "product_category",
        fields: ["id", "handle"],
    });

    const getCategoryId = (handle: string) => {
        const category = finalCategories.find((c: any) => c.handle === handle);
        return category ? category.id : null;
    };

    // Seed product collections
    const { data: existingCollections } = await query.graph({
        entity: "product_collection",
        fields: ["id", "handle"],
    });

    const collectionHandles = existingCollections.map((c: any) => c.handle);
    const collectionsToCreate: CreateProductCollectionDTO[] = [];

    if (!collectionHandles.includes("signature-flavors")) {
        collectionsToCreate.push({
            title: "Signature Flavors",
            handle: "signature-flavors",
        });
    }
    if (!collectionHandles.includes("mix-and-match")) {
        collectionsToCreate.push({
            title: "Mix & Match",
            handle: "mix-and-match",
        });
    }

    if (collectionsToCreate.length > 0) {
        logger.info("Creating product collections...");
        await createCollectionsWorkflow(container).run({
            input: {
                collections: collectionsToCreate,
            },
        });
    } else {
        logger.info("Product collections already exist, skipping creation...");
    }

    // Get collection IDs
    const { data: collections } = await query.graph({
        entity: "product_collection",
        fields: ["id", "handle"],
    });

    const getCollectionId = (handle: string) => {
        const collection = collections.find((c: any) => c.handle === handle);
        return collection ? collection.id : undefined;
    };

    // Helper functions
    const getAllImages = (variantImages: Record<string, string[]>) => {
        return Object.values(variantImages).flat();
    };

    const getFirstImage = (variantImages: Record<string, string[]>) => {
        const firstKey = Object.keys(variantImages)[0];
        return variantImages[firstKey][0];
    };

    // ============================================================
    // PRODUCT IMAGES – sourced from embracenutrition.in
    // ============================================================

    // === WATERMELON MINT ===
    const watermelonMintImages = {
        "Pack of 4": [
            "https://www.embracenutrition.in/uploads/product_image/102025/139ceaef56c8f741692d3ff23de58b41.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/7f3923962fa04139e46912e83d5acacc.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/352ca236075470e90e1822dae383c97f.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/46a9845ff09b60d75616529c218f449f.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/d36a5e98193a7b7a340889b38faba919.jpeg",
        ],
        "Pack of 6": [
            "https://www.embracenutrition.in/uploads/product_image/102025/139ceaef56c8f741692d3ff23de58b41.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/7f3923962fa04139e46912e83d5acacc.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/352ca236075470e90e1822dae383c97f.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/46a9845ff09b60d75616529c218f449f.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/d36a5e98193a7b7a340889b38faba919.jpeg",
        ],
        "Pack of 12": [
            "https://www.embracenutrition.in/uploads/product_image/102025/139ceaef56c8f741692d3ff23de58b41.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/7f3923962fa04139e46912e83d5acacc.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/352ca236075470e90e1822dae383c97f.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/46a9845ff09b60d75616529c218f449f.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/d36a5e98193a7b7a340889b38faba919.jpeg",
        ],
    };

    // === PEACH LEMON ===
    const peachLemonImages = {
        "Pack of 4": [
            "https://www.embracenutrition.in/uploads/product_image/102025/8f8773f9b890ef9c45e105d8c42a7daa.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/b85653ec8be6574f64df0ace53f32651.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/edb4f0b8d442513db8607377d41564cf.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/6244ad3c0875dbb5718aef47c1203047.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/d4e19b878077c7971e12eaff677c62a8.jpeg",
        ],
        "Pack of 6": [
            "https://www.embracenutrition.in/uploads/product_image/102025/8f8773f9b890ef9c45e105d8c42a7daa.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/b85653ec8be6574f64df0ace53f32651.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/edb4f0b8d442513db8607377d41564cf.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/6244ad3c0875dbb5718aef47c1203047.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/d4e19b878077c7971e12eaff677c62a8.jpeg",
        ],
        "Pack of 12": [
            "https://www.embracenutrition.in/uploads/product_image/102025/8f8773f9b890ef9c45e105d8c42a7daa.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/b85653ec8be6574f64df0ace53f32651.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/edb4f0b8d442513db8607377d41564cf.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/6244ad3c0875dbb5718aef47c1203047.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/d4e19b878077c7971e12eaff677c62a8.jpeg",
        ],
    };

    // === LEMON GINGER ===
    const lemonGingerImages = {
        "Pack of 4": [
            "https://www.embracenutrition.in/uploads/product_image/102025/8f1c69f6c0891f20d3a24b164c5ac5fe.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/94ddaf878fc20a10e45834e352405584.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/8dd0b8331ce8db58a6b92ee6ca535a32.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/719f2840d3e5b7134e99b557f42265ea.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/8b5f97d1387ac901e31d969e9410e140.jpeg",
        ],
        "Pack of 6": [
            "https://www.embracenutrition.in/uploads/product_image/102025/8f1c69f6c0891f20d3a24b164c5ac5fe.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/94ddaf878fc20a10e45834e352405584.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/8dd0b8331ce8db58a6b92ee6ca535a32.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/719f2840d3e5b7134e99b557f42265ea.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/8b5f97d1387ac901e31d969e9410e140.jpeg",
        ],
        "Pack of 12": [
            "https://www.embracenutrition.in/uploads/product_image/102025/8f1c69f6c0891f20d3a24b164c5ac5fe.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/94ddaf878fc20a10e45834e352405584.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/8dd0b8331ce8db58a6b92ee6ca535a32.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/719f2840d3e5b7134e99b557f42265ea.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/8b5f97d1387ac901e31d969e9410e140.jpeg",
        ],
    };

    // === FRUIT BEER ===
    const fruitBeerImages = {
        "Pack of 4": [
            "https://www.embracenutrition.in/uploads/product_image/102025/7a5749e35bfbb7f5fcd1ae3c3e1147ac.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/bd52641d9d4d4e218cbca7a2d83d41d1.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/02614cbdbacde3b482e90ae3746ea558.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/a4226c181bc2ef21764d442b72c2eed9.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/d03a201ae8d3ba986f5113ca90b9eae4.jpeg",
        ],
        "Pack of 6": [
            "https://www.embracenutrition.in/uploads/product_image/102025/7a5749e35bfbb7f5fcd1ae3c3e1147ac.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/bd52641d9d4d4e218cbca7a2d83d41d1.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/02614cbdbacde3b482e90ae3746ea558.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/a4226c181bc2ef21764d442b72c2eed9.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/d03a201ae8d3ba986f5113ca90b9eae4.jpeg",
        ],
        "Pack of 12": [
            "https://www.embracenutrition.in/uploads/product_image/102025/7a5749e35bfbb7f5fcd1ae3c3e1147ac.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/bd52641d9d4d4e218cbca7a2d83d41d1.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/02614cbdbacde3b482e90ae3746ea558.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/a4226c181bc2ef21764d442b72c2eed9.jpeg",
            "https://www.embracenutrition.in/uploads/product_image/102025/d03a201ae8d3ba986f5113ca90b9eae4.jpeg",
        ],
    };

    // === TRIPLE TREAT PACK (6 Pack) ===
    const tripleTreatPackImages = {
        "6 Pack": [
            "https://www.embracenutrition.in/uploads/variety_pack/102025/9fe57e1ceef5a1df340fcf4f5a7f5743.jpg",
            "https://www.embracenutrition.in/uploads/variety_pack/102025/488d5c4acecee12f87e3bafd9dd7f6f7.jpg",
        ],
    };

    // === EMBRACE MOOD MIX PACK (8 Pack) ===
    const moodMixPackImages = {
        "8 Pack": [
            "https://www.embracenutrition.in/uploads/variety_pack/102025/c004853b054ec94d85a0e3fc71f8fc9e.jpg",
            "https://www.embracenutrition.in/uploads/variety_pack/102025/af836a2620b06e731a35f0272b59b359.jpg",
        ],
    };

    // === LEMON GINGER + PEACH LEMON (6 Pack) ===
    const lgPlPackImages = {
        "6 Pack": [
            "https://www.embracenutrition.in/uploads/variety_pack/102025/6658bf07a2d7d77524b5b8d6a3a89e08.jpg",
            "https://www.embracenutrition.in/uploads/variety_pack/102025/ad198fee0f0160f5e2a10437bf132a38.jpg",
        ],
    };

    // === LEMON GINGER + WATERMELON (6 Pack) ===
    const lgWmPackImages = {
        "6 Pack": [
            "https://www.embracenutrition.in/uploads/variety_pack/102025/2ab0d938d7663a6f467c3869bc4fb37d.jpg",
            "https://www.embracenutrition.in/uploads/variety_pack/102025/8c35925cc5236c540ae98b78ffe3cf63.jpg",
        ],
    };

    // ============================================================
    // Helper to build INR + USD/EUR/GBP prices
    // ============================================================
    const buildPrices = (inr: number, usd: number, eur: number, gbp: number) => [
        { currency_code: "inr", amount: inr },
        { currency_code: "usd", amount: usd },
        { currency_code: "eur", amount: eur },
        { currency_code: "gbp", amount: gbp },
    ];

    // Seed products
    const { data: existingProducts } = await query.graph({
        entity: "product",
        fields: ["id", "handle"],
    });

    const existingHandles = existingProducts.map((p: any) => p.handle);

    const productsToCreate = [
        // ===========================================================
        // INDIVIDUAL FLAVORS
        // ===========================================================
        {
            title: "Watermelon Mint",
            handle: "watermelon-mint",
            subtitle: "Probiotic Sparkling Drink",
            description:
                "Bold watermelon meets refreshing mint in every sip. Lightly sparkling, gut-friendly, and crafted with prebiotics and dietary fiber. A naturally low-sugar fizz designed to nourish your gut while delighting your taste buds. Perfect with meals, as a mixer, or as your daily refresher.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: getCategoryId("probiotic-drinks")
                ? [getCategoryId("probiotic-drinks")!]
                : [],
            collection_id: getCollectionId("signature-flavors"),
            thumbnail: getFirstImage(watermelonMintImages),
            images: getAllImages(watermelonMintImages).map((url) => ({ url })),
            options: [
                { title: "Pack Size", values: ["Pack of 4", "Pack of 6", "Pack of 12"] },
            ],
            variants: [
                {
                    title: "Pack of 4",
                    sku: "WM-4PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 4" },
                    prices: buildPrices(389, 5, 5, 4),
                },
                {
                    title: "Pack of 6",
                    sku: "WM-6PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 6" },
                    prices: buildPrices(579, 7, 7, 6),
                },
                {
                    title: "Pack of 12",
                    sku: "WM-12PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 12" },
                    prices: buildPrices(1099, 13, 12, 11),
                },
            ],
            variantImageMap: watermelonMintImages,
        },
        {
            title: "Peach Lemon",
            handle: "peach-lemon",
            subtitle: "Probiotic Sparkling Drink",
            description:
                "Sweet peach and zesty lemon meet in this irresistibly refreshing fizz. Low sugar, gut-friendly, and packed with prebiotics and 6.25g of dietary fiber. A crush-worthy drink for any time of day — solo, with food, or as a sparkling mocktail base.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: getCategoryId("probiotic-drinks")
                ? [getCategoryId("probiotic-drinks")!]
                : [],
            collection_id: getCollectionId("signature-flavors"),
            thumbnail: getFirstImage(peachLemonImages),
            images: getAllImages(peachLemonImages).map((url) => ({ url })),
            options: [
                { title: "Pack Size", values: ["Pack of 4", "Pack of 6", "Pack of 12"] },
            ],
            variants: [
                {
                    title: "Pack of 4",
                    sku: "PL-4PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 4" },
                    prices: buildPrices(389, 5, 5, 4),
                },
                {
                    title: "Pack of 6",
                    sku: "PL-6PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 6" },
                    prices: buildPrices(579, 7, 7, 6),
                },
                {
                    title: "Pack of 12",
                    sku: "PL-12PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 12" },
                    prices: buildPrices(1099, 13, 12, 11),
                },
            ],
            variantImageMap: peachLemonImages,
        },
        {
            title: "Lemon Ginger",
            handle: "lemon-ginger",
            subtitle: "Probiotic Sparkling Drink",
            description:
                "Bright lemon with a warm ginger kick — a bold sparkling fizz that awakens every sip. Prebiotic-rich, low in sugar, and loaded with 6.25g of dietary fiber. A zingy daily ritual that's as good for your gut as it is for your mood.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: getCategoryId("probiotic-drinks")
                ? [getCategoryId("probiotic-drinks")!]
                : [],
            collection_id: getCollectionId("signature-flavors"),
            thumbnail: getFirstImage(lemonGingerImages),
            images: getAllImages(lemonGingerImages).map((url) => ({ url })),
            options: [
                { title: "Pack Size", values: ["Pack of 4", "Pack of 6", "Pack of 12"] },
            ],
            variants: [
                {
                    title: "Pack of 4",
                    sku: "LG-4PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 4" },
                    prices: buildPrices(389, 5, 5, 4),
                },
                {
                    title: "Pack of 6",
                    sku: "LG-6PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 6" },
                    prices: buildPrices(579, 7, 7, 6),
                },
                {
                    title: "Pack of 12",
                    sku: "LG-12PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 12" },
                    prices: buildPrices(1099, 13, 12, 11),
                },
            ],
            variantImageMap: lemonGingerImages,
        },
        {
            title: "Fruit Beer",
            handle: "fruit-beer",
            subtitle: "Probiotic Sparkling Drink",
            description:
                "All the depth and fizz of a craft beer — without the alcohol. Fruit Beer by Embrace is a boldly sparkling, non-alcoholic prebiotic drink with a naturally complex flavor. Low sugar, gut-friendly, and perfect for any occasion.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: getCategoryId("probiotic-drinks")
                ? [getCategoryId("probiotic-drinks")!]
                : [],
            collection_id: getCollectionId("signature-flavors"),
            thumbnail: getFirstImage(fruitBeerImages),
            images: getAllImages(fruitBeerImages).map((url) => ({ url })),
            options: [
                { title: "Pack Size", values: ["Pack of 4", "Pack of 6", "Pack of 12"] },
            ],
            variants: [
                {
                    title: "Pack of 4",
                    sku: "FB-4PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 4" },
                    prices: buildPrices(389, 5, 5, 4),
                },
                {
                    title: "Pack of 6",
                    sku: "FB-6PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 6" },
                    prices: buildPrices(579, 7, 7, 6),
                },
                {
                    title: "Pack of 12",
                    sku: "FB-12PACK",
                    manage_inventory: false,
                    options: { "Pack Size": "Pack of 12" },
                    prices: buildPrices(1099, 13, 12, 11),
                },
            ],
            variantImageMap: fruitBeerImages,
        },
        // ===========================================================
        // VARIETY PACKS
        // ===========================================================
        {
            title: "Triple Treat Pack",
            handle: "triple-treat-pack",
            subtitle: "Variety 6 Pack – 3 Flavors",
            description:
                "Can't pick just one? The Triple Treat Pack gives you 6 cans across 3 of Embrace's signature flavors. A perfect introduction to the full Embrace range — gut-friendly, lightly sparkling, and full of vibrant flavors your body will love.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: getCategoryId("variety-packs")
                ? [getCategoryId("variety-packs")!]
                : [],
            collection_id: getCollectionId("mix-and-match"),
            thumbnail: getFirstImage(tripleTreatPackImages),
            images: getAllImages(tripleTreatPackImages).map((url) => ({ url })),
            options: [
                { title: "Pack", values: ["6 Pack"] },
            ],
            variants: [
                {
                    title: "6 Pack",
                    sku: "TRIPLE-TREAT-6PACK",
                    manage_inventory: false,
                    options: { Pack: "6 Pack" },
                    prices: buildPrices(579, 7, 7, 6),
                },
            ],
            variantImageMap: tripleTreatPackImages,
        },
        {
            title: "Embrace Mood Mix Pack",
            handle: "embrace-mood-mix-pack",
            subtitle: "Variety 8 Pack – All Flavors",
            description:
                "Eight cans, four flavors, endless moods. The Embrace Mood Mix Pack brings you the full flavor lineup — 2 cans of each signature flavor — so you can match your drink to your vibe, every day of the week.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: getCategoryId("variety-packs")
                ? [getCategoryId("variety-packs")!]
                : [],
            collection_id: getCollectionId("mix-and-match"),
            thumbnail: getFirstImage(moodMixPackImages),
            images: getAllImages(moodMixPackImages).map((url) => ({ url })),
            options: [
                { title: "Pack", values: ["8 Pack"] },
            ],
            variants: [
                {
                    title: "8 Pack",
                    sku: "MOOD-MIX-8PACK",
                    manage_inventory: false,
                    options: { Pack: "8 Pack" },
                    prices: buildPrices(749, 9, 9, 8),
                },
            ],
            variantImageMap: moodMixPackImages,
        },
        {
            title: "Lemon Ginger + Peach Lemon Pack",
            handle: "lemon-ginger-peach-lemon-pack",
            subtitle: "Variety 6 Pack – 2 Flavors",
            description:
                "A zesty duo — 3 cans of Lemon Ginger and 3 cans of Peach Lemon. Bright, bold, and perfectly balanced. Share the love or keep them all to yourself — this pack is built for flavor adventurers.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: getCategoryId("variety-packs")
                ? [getCategoryId("variety-packs")!]
                : [],
            collection_id: getCollectionId("mix-and-match"),
            thumbnail: getFirstImage(lgPlPackImages),
            images: getAllImages(lgPlPackImages).map((url) => ({ url })),
            options: [
                { title: "Pack", values: ["6 Pack"] },
            ],
            variants: [
                {
                    title: "6 Pack",
                    sku: "LG-PL-6PACK",
                    manage_inventory: false,
                    options: { Pack: "6 Pack" },
                    prices: buildPrices(579, 7, 7, 6),
                },
            ],
            variantImageMap: lgPlPackImages,
        },
        {
            title: "Lemon Ginger + Watermelon Pack",
            handle: "lemon-ginger-watermelon-pack",
            subtitle: "Variety 6 Pack – 2 Flavors",
            description:
                "A refreshing contrast — bold Lemon Ginger meets juicy Watermelon Mint in one pack. 3 cans of each, crafted with prebiotics and 6.25g of fiber for a gut-nourishing, fizzy experience you'll want again and again.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: getCategoryId("variety-packs")
                ? [getCategoryId("variety-packs")!]
                : [],
            collection_id: getCollectionId("mix-and-match"),
            thumbnail: getFirstImage(lgWmPackImages),
            images: getAllImages(lgWmPackImages).map((url) => ({ url })),
            options: [
                { title: "Pack", values: ["6 Pack"] },
            ],
            variants: [
                {
                    title: "6 Pack",
                    sku: "LG-WM-6PACK",
                    manage_inventory: false,
                    options: { Pack: "6 Pack" },
                    prices: buildPrices(579, 7, 7, 6),
                },
            ],
            variantImageMap: lgWmPackImages,
        },
    ];

    const newProducts = productsToCreate.filter(
        (p) => !existingHandles.includes(p.handle)
    );

    if (newProducts.length > 0) {
        logger.info("Seeding products...");
        // Create products (without variantImageMap in the workflow input)
        const productsForWorkflow = newProducts.map(
            ({ variantImageMap, ...product }) => product
        );

        const { result: createdProducts } = await createProductsWorkflow(
            container
        ).run({
            input: {
                products: productsForWorkflow,
            },
        });

        // Link products to sales channel
        await linkProductsToSalesChannelWorkflow(container).run({
            input: {
                id: defaultSalesChannel[0].id,
                add: createdProducts.map((p) => p.id),
            },
        });

        // Assign images to variants
        logger.info("Assigning images to variants...");
        for (let i = 0; i < createdProducts.length; i++) {
            const createdProduct = createdProducts[i];
            const productConfig = newProducts[i];
            const variantImageMap = productConfig.variantImageMap;

            // Get the created product with images to find image IDs
            const {
                data: [productWithImages],
            } = await query.graph({
                entity: "product",
                fields: ["id", "images.*", "variants.*"],
                filters: { id: createdProduct.id },
            });

            // Create a map of URL to image ID
            const urlToImageId: Record<string, string> = {};
            for (const img of productWithImages.images || []) {
                urlToImageId[img.url] = img.id;
            }

            // Assign images to each variant
            for (const variant of productWithImages.variants || []) {
                const variantTitle = variant.title;
                // Try to match "Color / Size" pattern first, fallback to full title as key
                const colorMatch = variantTitle.match(/\/ ([A-Za-z-]+)$/);
                const key = colorMatch ? colorMatch[1] : variantTitle;

                const variantUrls = variantImageMap[key];

                if (variantUrls && variantUrls.length > 0) {
                    const imageIds = variantUrls
                        .map((url: string) => urlToImageId[url])
                        .filter((id: string | undefined): id is string => !!id);

                    if (imageIds.length > 0) {
                        await batchVariantImagesWorkflow(container).run({
                            input: {
                                variant_id: variant.id,
                                add: imageIds,
                                remove: [],
                            },
                        });
                    }
                }
            }
        }

        logger.info(
            `Created ${createdProducts.length} products with variant images.`
        );
    } else {
        logger.info("Products already exist, skipping.");
    }

    logger.info("Finished seeding data.");
}
