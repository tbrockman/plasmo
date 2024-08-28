/**
 * Copyright (c) 2023 Plasmo Corp. <foss@plasmo.com> (https://www.plasmo.com) and contributors
 * MIT License
 */

import {Reporter} from '@parcel/plugin';
import type { Diagnostic } from '@parcel/diagnostic';

function writeDiagnostic(diagnostic: Diagnostic, level: string) {
  let prefix = ''
  switch (level) {
    case 'verbose':
      prefix = '🔍'
      break;
    case 'info':
      prefix = 'ℹ️'
      break;
    case 'warn':
      prefix = '⚠️'
      break;
    case 'error':
      prefix = '🚨'
      break;
  }
  process.stdout.write(`${prefix} ${diagnostic.message}\n`);
}

export default new Reporter({
  report({event}) {
    if (event.type === 'log') {      
      switch (event.level) {
        case 'info':
        case 'verbose':
        case 'warn':
        case 'error':
          event.diagnostics.forEach(diagnostic => {
            writeDiagnostic(diagnostic, event.level);
          });
          break;
        case 'progress':
          process.stdout.write(`🕒 ${event.message}\n`);
        case 'success':
          process.stdout.write(`✅ ${event.message}\n`);
      }
    }
  }
});