import { Button, Text } from '@/ui';
import * as React from 'react';

export default function Screen() {
  return (
    <>
      <Button>
        <Text>Default</Text>
      </Button>
      <Button variant="destructive">
        <Text>Destructive</Text>
      </Button>
      <Button variant="outline">
        <Text>Outline</Text>
      </Button>
      <Button variant="secondary">
        <Text>Secondary</Text>
      </Button>
      <Button variant="ghost">
        <Text>Ghost</Text>
      </Button>
    </>
  );
}
