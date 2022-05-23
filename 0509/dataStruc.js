const NOTHING=-1;


function qSort(arr) {
	if (arr.length == 0) {
		return []
	}
	var left = []
	var right = []
	var pivot = arr[0]
	for (var i = 1; i < arr.length; i++) {
		if (arr[i] < pivot) {
			left.push(arr[i])
		} else {
			right.push(arr[i])
		}
	}
	return qSort(left).concat(pivot, qSort(right))
}

function insertSort(arr) {
	var len = arr.length
	for (i = 1; i < len; i++) {
		var key = arr[i]
		var j = i - 1
		while (j >= 0 && arr[j] > key) {
			arr[j + 1] = arr[j]
			j--;
		}
		arr[j + 1] = key
	}
	return arr
}

class queuesNode {
	element;
	next;
	constructor(e,n=null){
		this.element=e;
		this.next=n;
	}
}

class LinkedQueue{
	front;
    rear;
    size;
    Linked_Queues(){
        this.front=this.rear=null;
        this.size=0;
    }
    enqueue(e){
        if(this.rear==null){
            this.front=this.rear=new queuesNode(e,null);
        }
        else{
            this.rear.next=new queuesNode(e,null);
            this.rear=this.rear.next;
        }
        this.size++;
        return true;
    }
    dequeue(){
		var it;
        if(this.size==0){return NOTHING;}
        var temp=this.front;
        this.front= this.front.next;
        it=temp.element;
        this.size--;

        //非常重要的一步
        if(this.front==null){this.rear=null;}

        return it;
	}
}

class queue {
	constructor(){
		this.collection =new LinkedQueue();
	}
	push (elem) {
		this.collection.enqueue(elem);
	}
	pop () {
		return this.collection.dequeue();
	}
	front () {
		return this.collection.front.element;
	}
	empty () {
		return (this.collection.front == null);
	}
	size  () {
		return this.collection.size;
	}
}


class listNode{
	element;
	next;
	constructor(e,n=null){
		this.element=e;
		this.next=null;
	}
}

class linedList{
	head;
    tail;
    fence;
    rightcnt;
	leftcnt;

	constructor(){
		this.head=this.tail=this.fence=new listNode(0,null);
		this.leftcnt=0;
		this.rightcnt=1;
	}

	next(){
		if(this.fence==this.tail){
			return;
		}
		this.fence=this.fence.next;
		this.leftcnt++;
		this.rightcnt--;
	}

	leftLength(){
		return this.leftcnt;
	}

	rightLength(){
		return this.rightcnt;
	}

	setPos(pos){
        if(this.rightcnt+this.leftcnt<=pos){return false;}
        this.fence=this.head;
        this.rightcnt=this.leftcnt+this.rightcnt;
        this.leftcnt=0;
        while(pos--){
            this.fence=this.fence.next;
            this.leftcnt++;
            this.rightcnt--;
        }
        return true;
    }

	append(e){
        this.tail.next=new listNode(e,this.tail.next);
        this.tail=this.tail.next;
        this.rightcnt++;
        return true;
    }

	totalLength(){
		return this.leftLength()+this.rightLength()-1;
	}

	remove(){
        var it;
		if(this.fence==this.tail){return NOTHING;}
		var temp=this.fence.next;
        this.fence.next=this.fence.next.next;
		if(temp==this.tail){this.tail=this.fence;}
        it=temp.element;
        this.rightcnt--;
        return it;
    }

    setStart(){
        this.fence=this.head;
        this.rightcnt=this.leftcnt+this.rightcnt;
		this.leftcnt=0;
    }

    setEnd(){
        this.fence=this.tail;
        this.leftcnt=this.leftcnt+this.rightcnt-1;
		this.rightcnt=1;
    }

	clear(){
        while(this.head!=this.tail) {
            this.head = this.head.next;
        }
		this.fence=this.head;
        this.rightcnt=1;
		this.leftcnt=0;
    }

	getValue(){
        if(this.fence==this.tail){return NOTHING;}
        var it=this.fence.next.element;
        return it;
    }

}


class Maxheap{
	constructor(){
		this.data=[]
	}
	parent(a){
		return Math.floor((a-1)/2);
	}
	leftChild(a){
		return 2*(a+1)-1;
	}
	rightChild(a){
		return 2*(a+1);
	}
	swap(curPosition,parentIndex){
		var temp=this.data[curPosition];
		this.data[curPosition]=this.data[parentIndex];
		this.data[parentIndex]=temp;
	}
	insert(node){
		// var val = grid(node.x,node.y).;
		var curPosition=this.data.length;
		this.data[curPosition]=node;
		this.adjust_insert(curPosition);
		return true;
	}
	empty(){
		if(this.data.length==0){
			return true
		}
		else{
			return false
		}
	}
	remove(){
		if(this.data.length==0) return NOTHING;
		var max_node=this.data[0];
		if(this.data.length>1){
			this.data[0]=this.data.pop();
			this.adjust_remove();
		}
		else{
			this.data.pop();
			
		}
		return max_node;
	}
	adjust_insert(curPosition){
		var parentIndex=this.parent(curPosition);
		while(curPosition>0){
			if(this.data[curPosition].f<=this.data[parentIndex].f){
				break;
			}
			else{
				this.swap(curPosition,parentIndex);
				curPosition=parentIndex;
				parentIndex=this.parent(curPosition);
			}
		}
	}
	adjust_remove(){
		var leftNodeIndex=1;
		var rightNodeIndex=2;
		var curPosition;
		if(rightNodeIndex>=this.data.length){
			curPosition=leftNodeIndex;
		}
		else if(this.data[leftNodeIndex].f>this.data[rightNodeIndex].f){
			curPosition=leftNodeIndex;
		}
		else{
			curPosition=rightNodeIndex;
		}
	  	var parentIndex=this.parent(curPosition);
		while (curPosition<this.data.length) {
	  		if (this.data[curPosition].f<=this.data[parentIndex].f){
				break;
			} 
			else {
				this.swap(curPosition,parentIndex);
				leftNodeIndex=this.leftChild(curPosition);
		  		rightNodeIndex=this.rightChild(curPosition);
				if (leftNodeIndex>this.data.length-1 && rightNodeIndex>this.data.length){
					break;
				}
				else if (rightNodeIndex>this.data.length-1){
					curPosition=leftNodeIndex;
				}
		  		else if(this.data[leftNodeIndex].f>this.data[rightNodeIndex].f){
					curPosition=leftNodeIndex;
				}
				else{
					curPosition=rightNodeIndex;
				}
		  		parentIndex=this.parent(curPosition);
			}
		}
	}
}



class BSTnode{	//定义二叉树的点
	constructor(data){	//构造函数，传入数据
		this.root = this;
		this.data = data;
		this.left = null;
		this.right = null;
	}
}

class BST{
	constructor(){
		this.root = null;//初始化根节点
		this.node_num=0;
	}
	//插入节点
	insert(data){
		const newNode = new BSTnode(data);
		const insertNode = (node,newNode)=>{
			if(newNode.data<node.data){//如果插入的节点值比父节点值小，就插入到左节点上，反之插入到右节点上
				if(node.left == null){
					node.left = newNode;
					this.node_num++;
				}
				else{
					insertNode(node.left,newNode)//循环找到下一层左节点
				}
			}
			else{
				if(node.right ==null ){
					node.right = newNode;
					this.node_num++;
				}
				else{
					insertNode(node.right,newNode)
				}
			}
		}
		if((this.root==null)){
			this.root = newNode;
			this.node_num++;
		}
		else{
			insertNode(this.root,newNode)
		}
	}

	//遍历+输出
	Traverse(){
		let backs = [];
		const callback=data=>{
			return data
		}
		const traverseNode = (node,callback)=>{
			if(node!=null){
				traverseNode(node.left,callback);
				backs.push(callback(node.data));
				traverseNode(node.right,callback)
			}
		}
		traverseNode(this.root,callback)
		return backs
	}

	search(data){
		const searchNode = (node,data)=>{
			if(node == null) return false;
			if(node.data==data){
				return true;
			}
			return searchNode(data<node.data?node.left:node.right,data)
		}
		return searchNode(this.root,data)
	}

	//最小值查找
	min(node){
		const minNode = (node) =>{
			return node!=null ? (node.left!=null ? minNode(node.left):node):null
		}
		return minNode(node)
	}

	//最大值查找
	max(node){
		const maxNode = (node) =>{
			return node!=null ?(node.right!=null ? maxNode(node.right): node):null
		}
		return maxNode(node)
	}

	//从树中移除某个节点
	remove(data) {
		let removeNode = (node, data) => {
			if (node == null) {
				//console.log(1)
				return null;
			}
			if (node.data == data) {
				this.node_num--;
				if (node.left == null && node.right == null) return null;
				if (node.left == null) return node.right;
				if (node.right == null) return node.left;
				if (node.left != null && node.right != null) {
					let node_temp = this.min(node.right);
					node.data = node_temp.data;
					node.right = removeNode(node.right, node_temp.data);
					this.node_num++;
					return node
				}
			} 
			else if (data < node.data) {
				node.left = removeNode(node.left, data);
				return node;
			} 
			else {
				node.right = removeNode(node.right, data);
				return node;
			}
		}
		this.root=removeNode(this.root, data)
	}

	length(){
		return this.node_num;
	}
}

