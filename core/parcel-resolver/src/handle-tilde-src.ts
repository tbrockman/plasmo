import { extname, join, resolve } from "path"

import {
  relevantExtensionList,
  relevantExtensionSet,
  resolveSourceIndex,
  type ResolverProps,
  type ResolverResult
} from "./shared"

export async function handleTildeSrc({
  pipeline,
  specifier,
  dependency
}: ResolverProps): Promise<ResolverResult> {
  if (specifier[0] !== "~") {
    return null
  }

  const absoluteBaseFile = resolve(
    join(process.env.PLASMO_SRC_DIR, specifier.slice(1))
  )

  if (
    pipeline === "data-text" ||
    pipeline === "data-base64" ||
    pipeline === "data-env" ||
    pipeline === "data-text-env" ||
    pipeline === "raw" ||
    pipeline === "raw-env"
  ) {
    return {
      filePath: absoluteBaseFile
    }
  }

  const importExt = extname(absoluteBaseFile)

  // TODO: Potentially resolve other type of files (less import etc...) that Parcel doesn't account for
  if (importExt.length > 0 && relevantExtensionSet.has(importExt as any)) {
    return {
      filePath: absoluteBaseFile
    }
  }

  const parentExt = extname(dependency.resolveFrom)

  // console.log(`tildeSrc: resolveFrom: ${dependency.resolveFrom}`)

  const checkingExts = [
    parentExt,
    ...relevantExtensionList.filter((ext) => ext !== parentExt)
  ]

  // console.log(`tildeSrc: ${potentialFiles}`)

  return resolveSourceIndex(absoluteBaseFile, checkingExts)
}
