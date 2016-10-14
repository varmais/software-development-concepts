(function () {
  var network;
  var allNodes;
  var nodesDataSet;
  var container = document.getElementById('content');
  var highlightActive = false;
  var nodesDataset;
  var edgesDataset;

  fetch('concepts.dot')
    .then(res => res.text())
    .then(initNetworkData)
    .catch(console.error);

  function initNetworkData(DOTdata) {
    var parsedData = vis.network.convertDot(DOTdata);
    nodesDataset = new vis.DataSet(parsedData.nodes);
    edgesDataset = new vis.DataSet(parsedData.edges);
    drawNetwork();
  }

  function drawNetwork() {
    var data = {
      nodes: nodesDataset,
      edges: edgesDataset
    };

    var options = {
      nodes: {
        font: {
          size: 16
        }
      },
      edges: {
        width: 0.15,
        color: {inherit: 'from'},
        smooth: {
          type: 'continuous'
        }
      },
      interaction: {
        tooltipDelay: 200
      }
    };

    network = new vis.Network(container, data, options);
    allNodes = data.nodes.get({returnType: 'Object'});
    network.on('click', neighbourhoodHighlight);
  }

  function neighbourhoodHighlight(params) {
    // if something is selected:
    if (params.nodes.length > 0) {
      highlightActive = true;
      var i, j;
      var selectedNode = params.nodes[0];
      var degrees = 2;
      var connectedNodes = network.getConnectedNodes(selectedNode);

      hideNodes(allNodes);
      highlightSecondDegreeNodes(allNodes, connectedNodes, degrees);
      highlightFirstDegreeNodes(allNodes, connectedNodes);
      highlightMainNode(allNodes, selectedNode);
    } else if (highlightActive === true) {
      resetNodes(allNodes);
      highlightActive = false
    }

    // transform the object into an array
    var updateArray = [];
    for (nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(allNodes[nodeId]);
      }
    }
    nodesDataset.update(updateArray);
  }

  function hideNodes (allNodes) {
    for (var nodeId in allNodes) {
      allNodes[nodeId].color = 'rgba(200, 200, 200, 0.5)';
      hideLabel(allNodes[nodeId]);
    }
  }

  function getAllConnectedNodes (connectedNodes, degrees) {
    for (i = 1; i < degrees; i++) {
      for (j = 0; j < connectedNodes.length; j++) {
        return [].concat(network.getConnectedNodes(connectedNodes[j]));
      }
    }
  }

  function highlightSecondDegreeNodes (allNodes, connectedNodes, degrees) {
    var allConnectedNodes = getAllConnectedNodes(connectedNodes, degrees);
    for (i = 0; i < allConnectedNodes.length; i++) {
      allNodes[allConnectedNodes[i]].color = 'rgba(0, 0, 255, 0.3)';
      showLabel(allNodes[allConnectedNodes[i]]);
    }
  }

  function highlightFirstDegreeNodes (allNodes, connectedNodes) {
    for (i = 0; i < connectedNodes.length; i++) {
      allNodes[connectedNodes[i]].color = 'rgba(255, 0, 0, 0.3)';
      showLabel(allNodes[connectedNodes[i]]);
    }
  }

  function highlightMainNode (allNodes, selectedNode) {
    allNodes[selectedNode].color = 'rgba(255, 0, 0, 0.6)';
    allNodes[selectedNode].clicked = true;
    showLabel(allNodes[selectedNode]);
  }

  function resetNodes (allNodes) {
    for (var nodeId in allNodes) {
      allNodes[nodeId].color = allNodes[nodeId].clicked ? 'rgba(0, 255, 0, 0.4)' : 'rgba(0, 0, 255, 0.3)';
      showLabel(allNodes[nodeId]);
    }
  }

  function hideLabel (node) {
    if (node.hiddenLabel === undefined) {
      node.hiddenLabel = node.label;
      node.label = undefined;
    }
  }

  function showLabel (node) {
    if (node.hiddenLabel !== undefined) {
      node.label = node.hiddenLabel;
      node.hiddenLabel = undefined;
    }
  }
})();