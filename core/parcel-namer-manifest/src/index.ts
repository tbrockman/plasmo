/**
 * Copyright (c) 2023 Plasmo Corp. <foss@plasmo.com> (https://www.plasmo.com) and contributors
 * MIT License
 */
import { Namer } from "@parcel/plugin"
import { vLog } from "@plasmo/utils/logging"

export default new Namer({
  name({ bundle }) {
    vLog("@plasmohq/parcel-namer-manifest")

    const mainEntry = bundle.getMainEntry()

    if (!mainEntry) {
      return null
    }

    if (
      bundle.type === "json" &&
      mainEntry.filePath.endsWith(".plasmo.manifest.json") &&
      mainEntry.meta?.webextEntry
    ) {
      return "manifest.json"
    }

    if (typeof mainEntry.meta?.bundlePath === "string") {
      return mainEntry.meta.bundlePath
    }

    return null
  }
})
