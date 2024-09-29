/**
 * Copyright (c) 2023 Plasmo Corp. <foss@plasmo.com> (https://www.plasmo.com) and contributors
 * MIT License
 */

import type { Diagnostic } from "@parcel/diagnostic"
import { Reporter } from "@parcel/plugin"

function writeDiagnostic(diagnostic: Diagnostic, level: string) {
  let prefix = ""
  switch (level) {
    case "verbose":
      prefix = "🔍"
      break
    case "info":
      prefix = "ℹ️"
      break
    case "warn":
      prefix = "⚠️"
      break
    case "error":
      prefix = "🚨"
      break
  }
  process.stdout.write(`${prefix} ${diagnostic.message}\n`)
}

const levels = ["error", "warn", "success", "progress", "info", "verbose"]

export default new Reporter({
  report({ event, options }) {
    if (
      event.type === "log" &&
      (event.level == "progress" ||
        event.level == "success" ||
        levels.indexOf(options.logLevel) >= levels.indexOf(event.level))
    ) {
      switch (event.level) {
        case "verbose":
        case "info":
        case "warn":
        case "error":
          event.diagnostics.forEach((diagnostic) => {
            writeDiagnostic(diagnostic, event.level)
          })
          break
        case "progress":
          process.stdout.write(`🕒 ${event.message}\n`)
        case "success":
          process.stdout.write(`✅ ${event.message}\n`)
      }
    }
  }
})
