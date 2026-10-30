import React from 'react';
import {
  Stack,
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupAddon,
  Button,
} from '@reito/ui/basic';

/** A disabled action must not suggest that an otherwise editable field is disabled. */
export function InputGroupStatesExample() {
  return (
    <Stack>
      {(['input', 'textarea'] as const).map((kind) =>
        [false, true].map((disabled) => {
          const name = `${kind}-${disabled ? 'disabled' : 'editable'}`;
          return (
            <InputGroup key={name} aria-label={name}>
              {kind === 'input' ? (
                <InputGroupInput aria-label={`${name} field`} disabled={disabled} />
              ) : (
                <InputGroupTextarea aria-label={`${name} field`} disabled={disabled} />
              )}
              <InputGroupAddon align="block-end">
                <Button variant="outline" disabled>
                  Send
                </Button>
              </InputGroupAddon>
            </InputGroup>
          );
        }),
      )}
    </Stack>
  );
}
