import { MedusaContainer } from "@medusajs/framework"
import {
    ContainerRegistrationKeys,
    ModuleRegistrationName,
    Modules,
} from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/core-flows"

/**
 * Clears all seeded data so the migration seed will run fresh on next restart.
 * Run with: pnpm --filter backend reset
 */
export default async function resetDatabase(container: MedusaContainer) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const storeModuleService = container.resolve(ModuleRegistrationName.STORE)
    const regionModuleService = container.resolve(ModuleRegistrationName.REGION)
    const taxModuleService = container.resolve(ModuleRegistrationName.TAX)
    const fulfillmentModuleService = container.resolve(ModuleRegistrationName.FULFILLMENT)
    const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)

    // Delete products
    logger.info("Deleting all products...")
    const { data: products } = await query.graph({ entity: "product", fields: ["id"] })
    if (products.length > 0) {
        await deleteProductsWorkflow(container).run({
            input: { ids: products.map((p: any) => p.id) },
        })
        logger.info(`Deleted ${products.length} products`)
    }

    // Delete collections
    logger.info("Deleting all collections...")
    const { data: collections } = await query.graph({ entity: "product_collection", fields: ["id"] })
    if (collections.length > 0) {
        const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT)
        await productModuleService.deleteCollections(collections.map((c: any) => c.id))
        logger.info(`Deleted ${collections.length} collections`)
    }

    // Delete product categories
    logger.info("Deleting all product categories...")
    const { data: categories } = await query.graph({ entity: "product_category", fields: ["id"] })
    if (categories.length > 0) {
        const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT)
        await productModuleService.deleteProductCategories(categories.map((c: any) => c.id))
        logger.info(`Deleted ${categories.length} categories`)
    }

    // Delete regions
    logger.info("Deleting all regions...")
    const regions = await regionModuleService.listRegions({})
    if (regions.length > 0) {
        await regionModuleService.deleteRegions(regions.map((r: any) => r.id))
        logger.info(`Deleted ${regions.length} regions`)
    }

    // Delete tax regions
    logger.info("Deleting all tax regions...")
    const taxRegions = await taxModuleService.listTaxRegions({})
    if (taxRegions.length > 0) {
        await taxModuleService.deleteTaxRegions(taxRegions.map((t: any) => t.id))
        logger.info(`Deleted ${taxRegions.length} tax regions`)
    }

    // Delete fulfillment sets
    logger.info("Deleting all fulfillment sets...")
    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({})
    if (fulfillmentSets.length > 0) {
        await fulfillmentModuleService.deleteFulfillmentSets(fulfillmentSets.map((f: any) => f.id))
        logger.info(`Deleted ${fulfillmentSets.length} fulfillment sets`)
    }

    // Delete stock locations
    logger.info("Deleting all stock locations...")
    const stockLocations = await stockLocationModule.listStockLocations({})
    if (stockLocations.length > 0) {
        await stockLocationModule.deleteStockLocations(stockLocations.map((s: any) => s.id))
        logger.info(`Deleted ${stockLocations.length} stock locations`)
    }

    // Update store currencies back to allow re-seeding
    logger.info("Resetting store currencies...")
    const [store] = await storeModuleService.listStores()
    if (store) {
        await storeModuleService.updateStores(store.id, {
            supported_currencies: [],
            default_currency_code: "usd",
        } as any)
    }

    logger.info("✅ Database reset complete. Restart the backend to re-seed with new data.")
}
