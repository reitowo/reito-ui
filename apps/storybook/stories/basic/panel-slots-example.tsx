import {
  Inline,
  Panel,
  Spinner,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@reito/ui/basic';

/** Regions own the inset: the table region is flush, loading and error text sit in padded regions. */
export function PanelSlotsExample() {
  return (
    <Stack inset>
      <Panel flush>
        <Panel.Header title="records" />
        <Panel.Content>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>li.chen</TableCell>
                <TableCell>发送提醒</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Panel.Content>
        <Panel.Footer>
          <Text role="alert" variant="interface" tone="danger">
            暂时无法读取，请重试。
          </Text>
        </Panel.Footer>
      </Panel>
      <Panel flush>
        <Panel.Header title="loading" />
        <Panel.Content flush={false}>
          <Inline role="status">
            <Spinner aria-hidden="true" />
            <Text variant="interface" tone="muted">
              正在读取记录…
            </Text>
          </Inline>
        </Panel.Content>
      </Panel>
    </Stack>
  );
}
