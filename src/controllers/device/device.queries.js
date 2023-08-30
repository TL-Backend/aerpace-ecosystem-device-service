exports.getModelsByDeviceType = `SELECT id, name FROM aergov_device_models WHERE device_type = :device_type`;

exports.getVariantByModelId = `SELECT id, name FROM aergov_device_variants WHERE model_id = :modelId`;

exports.getVersionByVariantId = `SELECT id, name FROM aergov_device_versions WHERE variant_id = :variantId`;
