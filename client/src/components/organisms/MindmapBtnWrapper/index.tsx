import { useHistory } from 'react-router-dom';
import { clock, plusCircle } from 'img';
import { useRecoilState, useRecoilValue } from 'recoil';
import { getNextMapState, mindmapState } from 'recoil/mindmap';
import { getChildLevel } from 'utils/helpers';
import { BoxButton } from 'components/atoms';
import useProjectId from 'hooks/useRoomId';
import { selectedNodeIdState, selectedNodeState } from 'recoil/node';
import { Wrapper } from './style';
import { IMindmapData, IMindNode } from 'types/mindmap';

interface ITempNodeParams {
  mindmapData: IMindmapData;
  selectedNodeId: number | null;
}

const TEMP_NODE_ID = -1;

const createTempNode = ({ mindmapData, selectedNodeId }: ITempNodeParams) => {
  const { rootId, mindNodes } = mindmapData;
  const parentNode = { ...mindNodes.get(selectedNodeId ?? 0) } as IMindNode;
  const level = getChildLevel(parentNode!.level!);

  const tempNode = { nodeId: TEMP_NODE_ID, level: level, content: '', children: [] };
  parentNode!.children = [...parentNode!.children!, TEMP_NODE_ID];
  mindNodes.set(parentNode!.nodeId!, parentNode!);
  mindNodes.set(TEMP_NODE_ID, tempNode);

  const newMapState = getNextMapState({ mindNodes, rootId });

  return newMapState;
};

const MindmapWrapper: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useRecoilState(selectedNodeIdState);
  const selectedNode = useRecoilValue(selectedNodeState);
  const [mindmapData, setMindmapData] = useRecoilState(mindmapState);
  const history = useHistory();
  const projectId = useProjectId();

  const handleHistoryBtnClick = () => {
    history.push(`/history/${projectId}`);
  };

  const handlePlusNodeBtnClick = () => {
    if (selectedNodeId === TEMP_NODE_ID) return;
    if (selectedNode && selectedNode.level === 'TASK') return;

    const newMapState = createTempNode({ mindmapData, selectedNodeId });
    setSelectedNodeId(TEMP_NODE_ID);
    setMindmapData(newMapState);
  };

  return (
    <Wrapper>
      <BoxButton onClick={handleHistoryBtnClick} btnStyle={'large'} color={'primary1'}>
        <img src={clock} alt='히스토리 버튼'></img>
      </BoxButton>
      <BoxButton onClick={handlePlusNodeBtnClick} btnStyle={'large'} color={'primary1'} margin={'0 1rem'}>
        <img src={plusCircle} alt='노드 추가 버튼'></img>
        {'노드 추가하기'}
      </BoxButton>
    </Wrapper>
  );
};

export default MindmapWrapper;
