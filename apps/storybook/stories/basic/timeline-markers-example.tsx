import { Avatar, AvatarFallback } from '@reito/ui/basic';
import { Timeline } from '@reito/ui/complex';

export function TimelineMarkersExample() {
  return (
    <Timeline
      label="头像与系统活动"
      events={[
        {
          id: 'user',
          title: '示例用户',
          marker: (
            <Avatar size="sm" aria-label="示例用户头像">
              <AvatarFallback>示</AvatarFallback>
            </Avatar>
          ),
        },
        { id: 'system', title: '系统正在处理', status: 'current' },
      ]}
    />
  );
}
