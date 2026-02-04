import React, { useMemo, useCallback, useState } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    Position,
    Handle
} from 'reactflow';
import { Popup, Page, Navbar, Block, Button, f7 } from 'framework7-react';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../../../slices/settingsSlice';
import { IoMdClose } from 'react-icons/io';
import { translate } from '../../../../../utils/translate';
import { selectLanguages } from '../../../../../slices/languagesSlice';

const CustomNode = ({ data, id, selected, onClick, userNodeId }) => {
    const language = useSelector(selectLanguages)

    const nodeClickHandler = (e) => {
        e.stopPropagation();
        if (onClick) onClick(id, data);
    };

    return (
        <div
            className={`bg-white border rounded-lg shadow-md p-2 min-w-[200px] max-w-[250px] ${selected ? 'ring-2 ring-blue-500' : ''} cursor-pointer`}
            style={{
                background: id === userNodeId ? "#D4E2FD" : "#FFFFFF",
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: id === userNodeId ? '1px solid #A9C5FA' : 'none',
                padding: "15px",
                color: "black"
            }}
            onClick={nodeClickHandler}
        >
            <Handle
                type="source"
                position={Position.Bottom}
                id="source"
                style={{ bottom: -5, background: '#555', width: 10, height: 10 }}
                isConnectable={false}
            />

            <Handle
                type="target"
                position={Position.Top}
                id="target"
                style={{ top: -5, background: '#555', width: 10, height: 10 }}
                isConnectable={false}
            />

            <div style={{ fontWeight: 700, fontSize: "var(--font-md)", textAlign: "center" }}>{data.job_position}</div>
            <div style={{ fontSize: "var(--font-sm)", textAlign: "center" }}>
                {data.users[0]?.name}
                {data.users.length > 1 && `, +${data.users.length - 1} lainnya`}
            </div>
        </div>
    );
};

const nodeWidth = 250;
const nodeHeight = 100;

const getLayoutedElements = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: 'TB',
        ranksep: 150,
        nodesep: 100
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2
            }
        };
    });

    return { nodes: layoutedNodes, edges };
};

const OrganizationChart = ({ nodes, userNodeId }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [popupOpened, setPopupOpened] = useState(false);
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const getNodeId = (id) => `node-${id}`;

    const handleNodeClick = (nodeId, nodeData) => {
        setSelectedNode(nodeData);
        console.log("nodeData :", nodeData);

        const selectedNode = { id: nodeData.id, position: nodeData.job_position }
        localStorage.setItem('selected_node', JSON.stringify(selectedNode))

        // setPopupOpened(true);
        f7.views.main.router.navigate('/jobdesc-node/')
    };

    const closePopup = () => {
        setPopupOpened(false);
    };

    const nodeTypes = useMemo(() => ({
        customNode: (props) => (
            <CustomNode
                {...props}
                onClick={handleNodeClick}
                userNodeId={getNodeId(userNodeId)}
            />
        )
    }), [userNodeId]);


    const { initialNodes, initialEdges } = useMemo(() => {
        if (!nodes || nodes.length === 0) return { initialNodes: [], initialEdges: [] };

        const mappedNodes = nodes.map(node => ({
            id: getNodeId(node.data.id),
            type: 'customNode',
            data: node.data,
            position: { x: 0, y: 0 },
            draggable: false
        }));

        const edges = [];
        mappedNodes.forEach(node => {
            if (node.data.parent !== null && node.data.parent !== undefined) {
                edges.push({
                    id: `edge-${node.data.parent}-${node.data.id}`,
                    source: getNodeId(node.data.parent),
                    target: node.id,
                    sourceHandle: 'source',
                    targetHandle: 'target',
                    animated: false,
                    style: { stroke: '#A9C5FA', strokeWidth: 2 }
                });
            }
        });

        const layouted = getLayoutedElements(mappedNodes, edges);

        return {
            initialNodes: layouted.nodes,
            initialEdges: layouted.edges
        };
    }, [nodes]);

    const [flowNodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [flowEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(() => { }, []);

    if (!nodes || nodes.length === 0) {
        return <div className="text-center p-4">{translate('no_organization_data', language)}</div>;
    }

    return (
        <div style={{ width: '100%', height: '73vh', border: '1px solid #ddd', marginTop: "20px" }}>
            <ReactFlowProvider>
                <ReactFlow
                    nodes={flowNodes}
                    edges={flowEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    nodesDraggable={false}
                    elementsSelectable={true}
                    connectOnClick={false}
                    fitView
                    minZoom={0.2}
                    maxZoom={1.5}
                    attributionPosition="top-right"
                >
                    <Controls />
                    <Background color="#f0f0f0" gap={16} />
                </ReactFlow>
            </ReactFlowProvider>

            <Popup
                opened={popupOpened}
                onPopupClosed={closePopup}
                style={{ width: "90%", height: "70%", borderRadius: "12px", position: "absolute", top: 100, left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", color: theme === "light" ? "black" : "white" }}
            >
                {selectedNode && (
                    <div style={{ display: "flex", flexDirection: "column", padding: "20px", paddingTop: "12px" }}>
                        <div style={{ height: "90%", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-lg)", fontWeight: 700, marginTop: "-10px" }}>
                            <p>{translate('position_details', language)}</p>

                            <Button style={{ border: "none", color: theme === "light" ? "black" : "white", padding: 0, margin: 0 }} onClick={closePopup}>
                                <IoMdClose size={"20px"} />
                            </Button>
                        </div>

                        <div style={{ height: "56vh", overflow: "auto" }}>
                            <p className="text-md text-gray-600">{translate('position', language)} : {selectedNode.job_position}</p>
                            {selectedNode.description && (
                                <p className="text-md text-gray-600 mt-1">{translate('description', language)} : {selectedNode.description}</p>
                            )}
                            {selectedNode.department && (
                                <p className="text-md text-gray-600 mt-1">{translate('department', language)} : {selectedNode.department}</p>
                            )}
                            {selectedNode.users && selectedNode.users.length > 0 ? (
                                <div>
                                    <h4 className="font-semibold mb-2 text-gray-700">{translate('assigned_users', language)}</h4>
                                    <div className="bg-gray-50 rounded p-3">
                                        {selectedNode.users.map((user, index) => (
                                            <div key={user.id} className={`${index > 0 ? 'mt-2 pt-2 border-t border-gray-200' : ''}`}>
                                                <p className="font-medium text-md">{user.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="italic text-md text-gray-500">{translate('no_users', language)}</div>
                            )}
                        </div>
                    </div>
                )}
            </Popup>
        </div>
    );
};

export default OrganizationChart;