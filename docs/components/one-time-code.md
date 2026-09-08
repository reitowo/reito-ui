# OneTimeCode

`InputOTP` collects user input. `OneTimeCode` displays an existing code supplied by
the host, including locked, refreshing, empty, expired and async-copy states.

```tsx
import { OneTimeCode } from '@reito/ui/basic';

<OneTimeCode
  label="JumpServer 验证码"
  code={unlocked ? code : undefined}
  remainingSeconds={remainingSeconds}
  locked={!unlocked}
  loading={refreshing}
  onCopy={value => navigator.clipboard.writeText(value)}
/>
```

The host owns authentication, code generation, refreshing, time calculation and
clipboard access. Omit `onCopy` for a display without a copy action. The component
does not store codes, start timers or access the clipboard itself.

Locked, loading and expired values are absent from the component DOM, including
accessible labels and attributes. A nonfinite or nonpositive `remainingSeconds`
counts as expired; omit it when validity is managed elsewhere. `disabled` prevents
copying while retaining the visible value. Rejected callbacks show generic,
localizable feedback without exposing exception text. Concurrent copy requests
are prevented, and feedback for a rotated, locked or expired value is discarded.

Passing a code to a browser component is not secure storage: keep locked values
out of host props as well, and clear host memory when the application locks.
The examples use public fixture values and do not write to the real clipboard.

State and copy feedback labels have public override props. Theme and density inherit from `<html>`;
layout, typography, buttons and feedback reuse the existing shared tokens.
