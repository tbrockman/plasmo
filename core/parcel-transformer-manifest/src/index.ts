/**
 * Copyright (c) 2023 Plasmo Corp. <foss@plasmo.com> (https://www.plasmo.com) and contributors
 * MIT License
 *
 * Based on: https://github.com/parcel-bundler/parcel/tree/v2/packages/transformers/webextension
 * MIT License
 */
import { parse } from "@mischnic/json-sourcemap"
import { Transformer } from "@parcel/plugin"
import type { TargetSourceMapOptions } from "@parcel/types"
import { validateSchema } from "@parcel/utils"

import { vLog } from "@plasmo/utils/logging"

import { handleAction } from "./handle-action"
import { handleBackground } from "./handle-background"
import { handleContentScripts } from "./handle-content-scripts"
import { handleDeclarativeNetRequest } from "./handle-declarative-net-request"
import { handleDeepLOC } from "./handle-deep-loc"
import { handleDictionaries } from "./handle-dictionaries"
import { handleLocales } from "./handle-locales"
import { handleSandboxes } from "./handle-sandboxes"
import { handleTabs } from "./handle-tabs"
import { normalizeManifest } from "./normalize-manifest"
import { MV2Schema, MV3Schema } from "./schema"
import { getState, initState } from "./state"

async function collectDependencies() {
  normalizeManifest()

  await Promise.all([
    handleTabs(),
    handleSandboxes(),
    handleLocales(),
    handleAction(),
    handleDeclarativeNetRequest()
  ])

  handleContentScripts()
  handleDictionaries()
  handleDeepLOC()
  handleBackground()
}

const getSourceMapConfig = (): TargetSourceMapOptions => {
  switch (process.env.__PLASMO_FRAMEWORK_INTERNAL_SOURCE_MAPS) {
    case "inline": {
      return {
        inline: true,
        inlineSources: true
      }
    }
    case "external": {
      return {
        inline: false,
        inlineSources: false
      }
    }
    default: {
      return undefined
    }
  }
}

export default new Transformer({
  async transform({ asset, options }) {
    vLog("@plasmohq/parcel-transformer-manifest")
    // Set environment to browser, since web extensions are always used in
    // browsers, and because it avoids delegating extra config to the user

    asset.setEnvironment({
      context: "browser",
      outputFormat:
        asset.env.outputFormat === "commonjs"
          ? "global"
          : asset.env.outputFormat,
      engines: {
        browsers: asset.env.engines.browsers
      },
      sourceMap: asset.env.sourceMap && getSourceMapConfig(),
      includeNodeModules: asset.env.includeNodeModules,
      sourceType: asset.env.sourceType,
      isLibrary: asset.env.isLibrary,
      shouldOptimize: asset.env.shouldOptimize,
      shouldScopeHoist: asset.env.shouldScopeHoist
    })

    const code = await asset.getCode()
    const parsed = parse(code)
    const data = parsed.data

    const schema = data.manifest_version === 3 ? MV3Schema : MV2Schema

    validateSchema.diagnostic(
      schema,
      {
        data,
        source: code,
        filePath: asset.filePath
      },
      "@plasmohq/parcel-transformer-manifest",
      "Invalid Web Extension manifest"
    )

    await initState(asset, data, parsed.pointers, options)

    const state = getState()

    await collectDependencies()

    state.asset.setCode(JSON.stringify(data, null, 2))
    state.asset.meta.webextEntry = true

    vLog("+ Finished transforming manifest")
    return state.getAssets()
  }
})
