import React, { useCallback } from 'react';
import { Label, PopupItemLayout, PopupLayout } from 'components/molecules';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { selectedNodeState, selectedNodeIdState } from 'recoil/node';
import { priorityListState } from 'recoil/meta-data';
import { Input } from 'components/atoms';
import { isISODate, isPositiveNumber } from 'utils/form';
import Dropdown from 'components/molecules/Dropdown';
import useToast from 'hooks/useToast';
import useHistoryEmitter from 'hooks/useHistoryEmitter';
import { IMindNode } from 'types/mindmap';

export const NodeDetailWrapper = () => {
  const priorityList = useRecoilValue(priorityListState);
  const setSelectedNodeId = useSetRecoilState(selectedNodeIdState);
  const selectedNode = useRecoilValue(selectedNodeState);
  const { showMessage } = useToast();
  const { updateNodeContent, updateTaskInformation } = useHistoryEmitter();

  const handleCloseButton = () => setSelectedNodeId(null);
  const handleFocusAlarm = useCallback((msg: string) => () => showMessage(msg), [showMessage]);

  const handleBlurNodeDetail = useCallback(
    (info: keyof IMindNode) => (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.target.value === selectedNode?.[info]) {
        return;
      }
      const { nodeId, content } = selectedNode!;
      updateNodeContent({ nodeFrom: nodeId, dataFrom: { content: content }, dataTo: { content: e.target.value } });
      showMessage(`${info} ${e.target.value}로 변경.`);
    },
    [selectedNode, showMessage]
  );

  const handleChangeNodeDetail = useCallback(
    (info: keyof IMindNode) => (value: string) => {
      const prevValue = selectedNode?.[info];
      if (value === prevValue) {
        return;
      }
      updateTaskInformation({
        nodeFrom: selectedNode!.nodeId,
        dataFrom: { changed: { [info]: prevValue } },
        dataTo: { changed: { [info]: value } },
      });
      showMessage(`${info} ${value}로 변경.`);
    },
    [selectedNode, showMessage]
  );

  const handleBlurDueDate = useCallback(
    ({ target }: React.FocusEvent<HTMLInputElement>) => {
      if (!target.value) {
        return;
      }
      if (!isISODate(target.value)) {
        showMessage('YYYY-MM-DD 형식으로 입력하세요.');
        return;
      }
      const prevValue = selectedNode?.dueDate;
      if (target.value !== prevValue) {
        updateTaskInformation({
          nodeFrom: selectedNode!.nodeId,
          dataFrom: { changed: { dueDate: prevValue } },
          dataTo: { changed: { dueDate: target.value } },
        });
        showMessage(`마감 날짜 ${target.value}으로 변경.`);
        return;
      }
    },
    [selectedNode, showMessage]
  );

  const handleBlurEstimatedTime = useCallback(
    ({ target }: React.FocusEvent<HTMLInputElement>) => {
      if (!target.value) {
        return;
      }
      if (!isPositiveNumber(target.value)) {
        showMessage('숫자만 입력하세요. 단위는 시(hour)입니다.');
        return;
      }
      const newEstimatedTime = target.value + '시간';
      const prevValue = selectedNode?.estimatedTime;
      if (newEstimatedTime !== prevValue) {
        updateTaskInformation({
          nodeFrom: selectedNode!.nodeId,
          dataFrom: { changed: { estimatedTime: prevValue } },
          dataTo: { changed: { estimatedTime: newEstimatedTime } },
        });
        showMessage(`예상 소요 시간 ${newEstimatedTime}으로 변경.`);
        return;
      }
    },
    [selectedNode, showMessage]
  );

  return selectedNode ? (
    <PopupLayout title={selectedNode.backlogId} onClose={handleCloseButton} popupStyle='normal'>
      <PopupItemLayout title={'내용'}>
        <Input defaultValue={selectedNode.content} onBlur={handleBlurNodeDetail('content')} inputStyle='gray' margin='0.2rem 0 0 0'></Input>
      </PopupItemLayout>
      <PopupItemLayout title={'세부사항'}>
        <Label label='스프린트' labelStyle='small' ratio={0.5} htmlFor='sprint'>
          <Dropdown
            id='sprint'
            items={['스프린트1', '스프린트2']}
            placeholder={selectedNode.sprint ? selectedNode.sprint + '' : ''}
            onValueChange={handleChangeNodeDetail('sprint')}
            dropdownStyle='small'
          />
        </Label>
        <Label label='담당자' labelStyle='small' ratio={0.5} htmlFor='assignee'>
          <Dropdown
            id='assignee'
            items={['통키', '파피']}
            placeholder={selectedNode.assignee ? selectedNode.assignee + '' : ''}
            onValueChange={handleChangeNodeDetail('assignee')}
            dropdownStyle='small'
          />
        </Label>
        <Label label='마감 날짜' labelStyle='small' ratio={0.5} htmlFor='dueDate'>
          <Input
            id='dueDate'
            placeholder={selectedNode.dueDate}
            onFocus={handleFocusAlarm('YYYY-MM-DD 형식으로 입력하세요.')}
            onBlur={handleBlurDueDate}
            inputStyle='small'
            margin='0.1rem 0'
          />
        </Label>
        <Label label='예상 소요 시간' labelStyle='small' ratio={0.5} htmlFor='estimatedTime'>
          <Input
            id='estimatedTime'
            placeholder={selectedNode.estimatedTime}
            onFocus={handleFocusAlarm('숫자만 입력하세요. 단위는 시(hour)입니다.')}
            onBlur={handleBlurEstimatedTime}
            inputStyle='small'
            margin='0.1rem 0'
          />
        </Label>
        <Label label='중요도' htmlFor='priority' labelStyle='small' ratio={0.5}>
          <Dropdown
            id='priority'
            items={priorityList}
            placeholder={selectedNode.priority}
            onValueChange={handleChangeNodeDetail('priority')}
            dropdownStyle='small'
          />
        </Label>
      </PopupItemLayout>
      <PopupItemLayout title={'라벨'}>라벨정보</PopupItemLayout>
    </PopupLayout>
  ) : null;
};

export default NodeDetailWrapper;
