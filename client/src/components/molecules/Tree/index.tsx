import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { Node, PriorityIcon, UserIcon } from 'components/atoms';
import { Path, TempNode } from 'components/molecules';
import { TCoord, TRect, getCurrentCoord, getGap, getType, calcRect, Levels } from 'utils/helpers';
import { getNextMapState, mindmapState, TEMP_NODE_ID } from 'recoil/mindmap';
import { selectedNodeIdState } from 'recoil/node';
import { NodeContainer, ChildContainer } from './style';
import useHistoryEmitter from 'hooks/useHistoryEmitter';
import { IMindmapData, IMindNode, IMindNodes } from 'types/mindmap';
import { ITaskFilters } from 'components/organisms/MindmapTree';
import { IUser } from 'types/user';

interface ITreeProps {
  nodeId: number;
  mindmapData: IMindmapData;
  parentCoord: TCoord | null;
  parentId?: number;
  taskFilters: ITaskFilters;
  userList: Record<string, IUser>;
}

interface ICheckFilterProps {
  node: IMindNode;
  taskFilters: ITaskFilters;
}

interface IGetStatusProps {
  isRoot: boolean;
  level: Levels;
  mindNodes: IMindNodes;
  node: IMindNode;
}

const checkFiltering = ({ node, taskFilters }: ICheckFilterProps) => {
  const { sprintId, assigneeId, labels } = node;
  if (!(sprintId || assigneeId || labels)) return false;

  const [sprintFilter, userFilter, labelFilter] = Object.values(taskFilters);
  if (!(sprintFilter || userFilter || labelFilter)) return false;

  return (
    (!sprintFilter || parseInt(sprintId + '') === sprintFilter) &&
    (!userFilter || assigneeId === userFilter) &&
    (!labelFilter || (labels && labels.includes(labelFilter)))
  );
};

//끔찍한 코드... 근데 방법이 없다. 리팩토링 때 절대 까먹지 않기 위해 주석을 지우지 않겠다..
const isAllTaskDone = (storyNode: IMindNode, mindNodes: IMindNodes) => {
  const doneTaskNumber = storyNode.children.filter((childId) => mindNodes.get(childId)?.status === 'Done').length;
  return storyNode.children.length === doneTaskNumber;
};

const getStatus = ({ isRoot, level, mindNodes, node }: IGetStatusProps) => {
  const { status, children } = node;
  if (isRoot) return 'To Do';
  if (level === 'TASK') return status ? status : 'To Do';
  if (level === 'STORY' && children.length) return isAllTaskDone(node, mindNodes) ? 'Done' : 'To Do';
};

const Tree: React.FC<ITreeProps> = ({ nodeId, mindmapData, parentCoord, parentId, taskFilters, userList }) => {
  const { rootId, mindNodes } = mindmapData;
  const node = mindNodes.get(nodeId)!;
  const { level, content, children, assigneeId, priority } = node;
  const assignee = assigneeId ? userList[assigneeId] : null;
  const isRoot = nodeId === rootId;
  const isFilteredTask = level === 'TASK' && checkFiltering({ node, taskFilters });
  const status = getStatus({ mindNodes, node, level, isRoot });

  const { addNode } = useHistoryEmitter();
  const setMindmapData = useSetRecoilState(mindmapState);

  const [selectedNodeId, setSelectedNodeId] = useRecoilState(selectedNodeIdState);
  const isSelected = selectedNodeId === nodeId;

  const [coord, setCoord] = useState<TCoord | null>(null);
  const [rect, setRect] = useState<TRect | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!nodeRef.current || !containerRef.current) return;

    const currentNode: HTMLElement = nodeRef.current;
    const currentContainer: HTMLElement = containerRef.current;

    const currentCoord = getCurrentCoord(currentNode);
    const gap = getGap(currentContainer);

    setCoord(currentCoord);

    if (!parentCoord || !currentCoord || !gap) return;
    const type = getType({ parentCoord, currentCoord, gap });

    setRect(calcRect({ parentCoord, currentCoord, gap, type }));
  }, [parentCoord, mindNodes]);

  const removeTempNode = () => {
    const parent = mindNodes.get(parentId!);
    parent!.children = parent!.children.filter((childId) => childId !== nodeId);
    mindNodes.set(parentId!, parent!);
    mindNodes.delete(nodeId);
    const newMapData = getNextMapState({ rootId, mindNodes });
    setMindmapData(newMapData);
  };

  const addNewNode = (nodeContent: string) => {
    const payload = {
      nodeFrom: parentId!,
      dataTo: { content: nodeContent, level: level },
    };

    addNode(payload);
    setSelectedNodeId(null);
  };

  const handleNodeContentFocusout = ({ currentTarget }: FormEvent<HTMLInputElement>) => {
    const targetContent = currentTarget.value;

    if (targetContent) addNewNode(targetContent);
    removeTempNode();
  };

  const handleNodeContentEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const targetContent = event.currentTarget.value;

    if (targetContent) addNewNode(targetContent);
    removeTempNode();
  };

  return (
    <NodeContainer id={nodeId + 'container'} ref={containerRef} isRoot={isRoot} draggable='true' className='mindmap-area'>
      {nodeId === TEMP_NODE_ID ? (
        <TempNode
          refProp={nodeRef}
          id={nodeId.toString()}
          isSelected={isSelected}
          level={level}
          onBlur={handleNodeContentFocusout}
          onKeyPress={handleNodeContentEnter}
        />
      ) : (
        <Node
          ref={nodeRef}
          id={nodeId.toString()}
          level={level}
          isSelected={isSelected}
          isFiltered={isFilteredTask}
          className='node mindmap-area'
          status={status}
        >
          {!!assignee && <UserIcon user={assignee} />}
          {!!priority && <PriorityIcon priority={priority} />}
          {content}
        </Node>
      )}
      <ChildContainer>
        {children.map((childrenId) => (
          <Tree
            key={childrenId}
            nodeId={childrenId}
            mindmapData={mindmapData}
            parentCoord={coord}
            parentId={nodeId}
            taskFilters={taskFilters}
            userList={userList}
          />
        ))}
      </ChildContainer>
      <Path rect={rect} />
    </NodeContainer>
  );
};

export default Tree;
