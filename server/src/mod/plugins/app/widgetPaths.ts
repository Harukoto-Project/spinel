import { fail } from '../readers.js';
import { WIDGET_FORMATS } from './appTypes.js';
import { extractPlaceholders } from './placeholders.js';

export const JSON_PATH_PATTERN = /^[A-Za-z_][\w-]*(?:\.[A-Za-z_][\w-]*|\[(?:\d+|\*)\])*$/;

export const validateJsonPath = (value: string, at: string): void => {
  if (!JSON_PATH_PATTERN.test(value)) {
    fail(at, 'JSON のパスを指定してください(例: summary.videos.percent / months[*].subjects[*])');
  }
};

export const validateWidgetTemplate = (text: string, at: string): void => {
  for (const name of extractPlaceholders(text, at)) {
    const [path = '', format, ...rest] = name.split('|').map((part) => part.trim());
    if (rest.length > 0) return fail(at, `{${name}} の書式指定は1つだけです`);
    validateJsonPath(path, at);
    if (format !== undefined && !(WIDGET_FORMATS as readonly string[]).includes(format)) {
      return fail(at, `書式 "${format}" は使えません(${WIDGET_FORMATS.join(' / ')})`);
    }
  }
};
