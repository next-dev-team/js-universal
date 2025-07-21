import { useEffect } from 'react';
import { Button, Modal, Progress } from 'antd';

const VersionUpdate = () => {
  useEffect(() => {
    if (!window.electronAPI?.checkUpdate) return;
    
    const { watchVersionUpdateMsg, confirmUpdate } = window.electronAPI.checkUpdate;
    let progressModal: ReturnType<typeof Modal.info> | undefined;

    watchVersionUpdateMsg(async (arg: {
      state: number;
      message: {
        percent: number;
      };
    }) => {
      switch (arg.state) {
        case 3:
          if (!progressModal) {
            const percent = +arg.message.percent.toFixed(0);
            progressModal = Modal.info({
              content: <Progress percent={percent} />,
            });
          } else {
            const percent = +arg.message.percent.toFixed(0);
            progressModal.update((prevConfig) => {
              return {
                ...prevConfig,
                content: <Progress percent={percent} />,
              };
            });
          }
          break;
        case 4: {
          progressModal?.destroy();
          const result = await confirmUpdate();
          if (result.code !== 0) {
            Modal.error({
              title: `Update failed, reason: ${result.message}`,
            });
          }
          break;
        }
      }
    });
  }, []);
  const onCheckUpdate = async () => {
    if (!window.electronAPI?.checkUpdate) return;
    
    const data = await window.electronAPI.checkUpdate.checkUpdate();
    if (data.code !== 0) {
      Modal.error({
        title: `Update failed, reason: ${data.message}`,
      });
      return;
    }
    switch (data.data!.state) {
      case -1:
        Modal.error({
          title: `Update failed, reason: ${data.data!.message}`,
        });
        break;
      case 1:
        Modal.confirm({
          title: 'Prompt',
          content: `New version V${data.data!.message} detected, update?`,
          onOk: async () => {
            const result = await window.electronAPI!.checkUpdate.confirmDownload();
            if (result.code !== 0) {
              Modal.error({
                title: `Update failed, reason: ${result.message}`,
              });
            }
          },
        });
        break;
      case 2:
        Modal.success({
          content: 'Already the latest version',
        });
        break;
    }
  };

  return (
    <>
      <Button onClick={onCheckUpdate}>check-update</Button>
    </>
  );
};
export default VersionUpdate;
