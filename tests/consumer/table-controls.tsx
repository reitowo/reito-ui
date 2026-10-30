import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Inline,
  Input,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableSortButton,
  TableRow,
  Theme,
} from '@reito/ui/basic';
import { useState } from 'react';

// 仅通过编译后的公开包组合，复现应用的行内按钮及设置弹层，不添加应用 CSS。
export function TableControlsDemo() {
  const [direction, setDirection] = useState<'none' | 'ascending' | 'descending'>('none');
  return (
    <Stack inset>
      <Table aria-label="排序表头">
        <TableHeader>
          <TableRow>
            <TableHead aria-sort={direction}>
              <TableSortButton
                direction={direction}
                onClick={() => setDirection(direction === 'ascending' ? 'descending' : 'ascending')}
              >
                用户
              </TableSortButton>
            </TableHead>
            <TableHead aria-sort="descending">
              <TableSortButton direction="descending" disabled>
                金额
              </TableSortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead scope="row">li.chen</TableHead>
            <TableCell>120.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button data-testid="toolbar-button">刷新</Button>
      <Table aria-label="账号">
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow data-testid="action-row">
            <TableCell>测试服务号</TableCell>
            <TableCell>
              <Inline>
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" data-testid="row-button" />}>
                    设置
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>账号设置</DialogTitle>
                      <DialogDescription>本地组件示例，不提交真实设置。</DialogDescription>
                    </DialogHeader>
                    <Input aria-label="名称" defaultValue="测试服务号" />
                    <DialogFooter>
                      <DialogClose render={<Button data-testid="dialog-button" />}>
                        关闭
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button disabled data-testid="row-disabled">
                  停用
                </Button>
              </Inline>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>显式尺寸</TableCell>
            <TableCell>
              <Button size="default" data-testid="row-explicit">
                常规尺寸
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Theme defaults={{ Button: { size: 'lg' } }}>
        <Table aria-label="主题覆盖">
          <TableBody>
            <TableRow>
              <TableCell>
                <Inline>
                  <Button data-testid="row-themed">主题尺寸</Button>
                  <Button size="xs" data-testid="row-themed-explicit">
                    显式 XS
                  </Button>
                </Inline>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Theme>
    </Stack>
  );
}
