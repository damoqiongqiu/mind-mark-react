import React, { useState, useEffect } from 'react';
import { Tree } from 'primereact/tree';
import { Button } from 'primereact/button';
import "./index.scss";

export default props => {
  const [nodes, setNodes] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);  // 添加新的状态来存储完整节点数据

  // 根据 key 查找节点
  const findNodeByKey = (nodes, key) => {
    let path = key.split('-');
    let node;

    while (path.length) {
      let list = node ? node.children : nodes;
      let currentKey = path.shift();
      node = list[parseInt(currentKey, 10)];
    }

    return node;
  };

  // 展开节点时加载子节点
  const loadOnExpand = (event) => {
    showGlobalSpin();

    setTimeout(() => {
      const parentNode = { ...findNodeByKey(nodes, event.node.key) };
      parentNode.children = Array.from({ length: 3 }, (_, index) => ({
        id: index,
        key: `${parentNode.key}-${index}`,
        nodeType: parentNode.nodeType === 'schema' ? "table" : "column",
        label: `${parentNode.nodeType === 'schema' ? 'Table' : 'Column'} ${parentNode.key}-${index}`,
        leaf: parentNode.nodeType === 'table' ? true : false,
        selectable: parentNode.nodeType === 'table',
      }));

      const newNodes = JSON.parse(JSON.stringify(nodes));
      let targetNode = findNodeByKey(newNodes, event.node.key);
      targetNode.children = parentNode.children;
      setNodes(newNodes);

      hideGlobalSpin();
    }, 500);
  };

  // 创建初始节点
  const createLazyNodes = () => {
    return Array.from({ length: 3 }, (_, index) => ({
      id: index,
      label: `Schema ${index}`,
      dbType: 'mysql',
      key: index.toString(),
      leaf: false,
      selectable: false,
      nodeType: "schema",
    }));
  }

  useEffect(() => {
    setTimeout(() => {
      setNodes(createLazyNodes());
    }, 2000);
  }, []);

  // 处理节点选择变化
  const handleSelectionChange = (event) => {
    const prevKeys = selectedKeys || {};
    const newKeys = event.value || {};

    // 找出当前被点击的节点
    const changedKeys = [
      ...Object.keys(newKeys).filter(key => !prevKeys[key]),
      ...Object.keys(prevKeys).filter(key => !newKeys[key])
    ];
    const changedKey = changedKeys.reduce((longest, current) =>
      current.length > longest.length ? current : longest,
      ''
    );

    if (changedKey) {
      const clickedNode = findNodeByKey(nodes, changedKey);

      if (clickedNode?.nodeType === 'column') {
        const parentKey = changedKey.substring(0, changedKey.lastIndexOf('-'));
        const grandParentKey = parentKey.substring(0, parentKey.lastIndexOf('-'));

        // 删除同级的其他选中状态
        Object.keys(newKeys).forEach(key => {
          if (key.startsWith(parentKey) && key !== changedKey && key !== parentKey) {
            delete newKeys[key];
          }
        });
      }
    }

    setSelectedKeys(newKeys);
    setSelectedNodes(
      Object.keys(newKeys)
        .map(key => findNodeByKey(nodes, key))
    );
  };

  // 处理保存操作
  const handleSave = () => {
    if (!selectedNodes.length) {
      mmkToast({
        severity: 'warn',
        summary: '提示',
        detail: '请选择要保存的列',
      });
      return;
    }

    const schemaNodes = selectedNodes.filter(node => node.nodeType === 'schema');
    const tableNodes = selectedNodes.filter(node => node.nodeType === 'table');

    // 处理 schema 数据
    const schemaData = schemaNodes.map(node => {
      const dbNode = findNodeByKey(nodes, node.key.split('-')[0]);
      return {
        id: node.id,
        dbId: dbNode.id,
        schemaName: node.label
      };
    });

    // 处理 table 数据
    const tableData = tableNodes.map(node => {
      const schemaKey = node.key.split('-')[0];
      const schemaNode = findNodeByKey(nodes, schemaKey);

      const selectedColumn = selectedNodes.find(n =>
        n.nodeType === 'column' &&
        n.key.startsWith(node.key)
      );

      return {
        id: node.id,
        schemaId: schemaNode.id,
        tableName: node.label,
        idColumn: selectedColumn?.label || ''
      };
    });

    console.log('Schema Data:', schemaData);
    console.log('Table Data:', tableData);

    // TODO: 调用保存接口
    // saveSchemaAndTables(schemaData, tableData).then(() => {
    //   mmkToast({ severity: 'success', summary: '成功', detail: '保存成功' });
    // }).finally(() => {
    //   hideGlobalSpin();
    // });
  };

  // 自定义页脚模板
  const footerTemplate = () => {
    return (
      <div className="d-flex align-items-center justify-content-between w-100 p-2">
        <div className="d-flex align-items-center gap-3">
          <Button
            icon="pi pi-save"
            className="p-button-success p-button-sm"
            onClick={handleSave}
          />
          <Button
            icon="pi pi-refresh"
            className="p-button-secondary p-button-sm"
            onClick={() => setNodes(createLazyNodes())}
          />
          <span>共选择 {selectedNodes.length} 项</span>
        </div>
      </div>
    );
  };

  return (
    <div className="card flex justify-content-center">
      <Tree
        value={nodes}
        onExpand={loadOnExpand}
        selectionMode="checkbox"
        selectionKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        className="w-full custom-scrollbar"
        style={{
          maxHeight: '600px',
          overflowY: 'auto'
        }}
        footer={footerTemplate}
        pt={{
          root: { className: 'h-full' },
          wrapper: { className: 'h-full' },
          node: { className: 'py-1' },
          content: { className: 'py-0' },
          container: { className: 'py-0' }
        }}
      />
    </div>
  )
}