import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";
import Position from "../GameSystems/Targeting/Position";

// TODO Construct a NavigationPath object using A*

/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system. 
 * 
 * - Peter
 */


class Node{
    parent:Node
    position:Vec2
    g:number
    h:number
    f:number
    y:number
    constructor(parent,y) {
        this.parent = parent;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.y = y;
    }
}

// [136, 54],
//             [112, 40],
//             [136, 40],
//             [158, 158],
//             [134, 158],
//             [136, 264],
//             [168, 256],
//             [160, 242],
//             [194, 132],
//             [192, 156]


export default class AstarStrategy extends NavPathStrat {
    
    // walls:OrthogonalTilemap;

    // public constructor(mesh: Navmesh, walls) {
    //     super(mesh);
    //     this.walls = walls;
    // }

    /**
     * @see NavPathStrat.buildPath()
     */
    public buildPath(to: Vec2, from: Vec2): NavigationPath {

        // Get the closest nodes in the graph to our to and from positions
        let start = this.mesh.graph.snap(from);
		let end = this.mesh.graph.snap(to);

		// let pathStack = new Stack<Vec2>(this.mesh.graph.numVertices);
		
        // console.log(start)
        // console.log(end)

        // console.log(this.mesh.graph.getNodePosition( this.mesh.graph.snap(new Vec2(148,148))))
        // console.log("SSSSSSSSSSSSSSSSSSS")


        let openList: Array<Node> = new Array()
        let closedList: Array<Node> = new Array()
        // Add the start node

        let startNode = new Node(null,start);

        let endNode = new Node(null,end);

        openList.push(startNode)



        while(openList.length > 0){
            // Get the current node
            let currentNode = openList[0]
            let currentIndex = 0

            // let the currentNode equal the node with the least f value
            let index = 0
            for(const node of openList){
                if(node.f < currentNode.f){
                    currentNode = node
                    currentIndex += 1
                }
                index += 1
            }

            // remove the currentNode from the openList
            openList.splice(currentIndex, 1);
            // add the currentNode to the closedList
            closedList.push(currentNode);
            // Found the goal
            if(currentNode.y === endNode.y){
                let result:Stack<Vec2> = new Stack(this.mesh.graph.numVertices);
                result.push(to.clone());

                let backtrack = currentNode;
                let id = 0;
                
                while(backtrack !== null){

                    // let zz = this.walls.getTileColRow(this.mesh.graph.snap(this.mesh.graph.getNodePosition(backtrack.y)))
                    //  //
                    // if(!this.walls.isTileCollidable(zz.x,zz.y) && id % 3 == 0){
                    //     let x = this.walls.getWorldPosition(zz.x,zz.y)
                    //     result.push(x)
                    // }
                    if(id % 4 === 0){
                        let x = this.mesh.graph.getNodePosition(backtrack.y)
                        result.push(x)
                    }
                    
                    // console.log(backtrack.y)
                    
                    
                    backtrack = backtrack.parent
                    id+=1;
                }
                // console.log(result)
                
                return new NavigationPath(result);
            }
            // Generate children
            // let the children of the currentNode equal the adjacent nodes
            let children = []
            let child = this.mesh.graph.getEdges(currentNode.y)

            while(child !== null && child !== undefined){
                let newNode = new Node(currentNode,child.y)
                children.push(newNode)
                child = child.next
            }

            // for each child in the children
            for(const i of children){
                // Child is on the closedList
                let flag = 1
                for(const j of closedList){
                    if(i.y === j.y){
                        flag = 0
                    }
                }
                if(flag === 1){
                    // Create the f, g, and h values
                    i.g = currentNode.g + 1
                    // i.h = this.walls.getWorldPosition(this.walls.getTileColRow(i.y).x,this.walls.getTileColRow(i.y).y).distanceTo(this.walls.getWorldPosition(this.walls.getTileColRow(end).x,this.walls.getTileColRow(end).y))
                    i.h = this.mesh.graph.getNodePosition(i.y).distanceTo(this.mesh.graph.getNodePosition(end))
                    i.f = i.g + i.h
    
                    // Child is already in the open list
                    for(const j of openList){
                        if(i.y === j.y){
                            flag = 0
                        }   
                        
                    }
                        
                    if(flag === 1){
                        openList.push(i)
                    }
                }   
            }
        }
        return new NavigationPath(new Stack());
    }
    
}