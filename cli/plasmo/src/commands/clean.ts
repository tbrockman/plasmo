import { iLog } from "@plasmo/utils/logging"
import { emptyDir } from "fs-extra"
import { getCommonPath } from "~features/extension-devtools/common-path"

export default async function clean() {
    iLog("Cleaning cache...")
    const commonPath = getCommonPath()
    iLog("Cache path: ", commonPath.dotPlasmoDirectory)
    await emptyDir(commonPath.dotPlasmoDirectory)
    iLog("Cache cleaned!")
}
