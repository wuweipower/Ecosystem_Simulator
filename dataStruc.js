function qSort (arr) {
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
function insertSort (arr) {
	var len = arr.length
	for (i = 1; i < len; i++) {
		var key = arr[i]
		var j = i - 1
		while (j >= 0 && arr[j] > key) {
			arr[j+1] = arr[j]
			j--;
		}
		arr[j+1] = key
	}
	return arr
}

function queue()
{
	var collection = [];
	this.push = function(elem)
	{
		collection.push(elem);
	}
	this.pop = function()
	{
		return collection.shift();
	}
	this.front = function()
	{
		return collection[0];
	}
	this.empty = function()
	{
		return collection.length===0;
	}
	this.size = function()
	{
		return collection.length;
	}
}

function priority_queue()
{
	var collection = [];
	this.pop = function()
	{
		return collection.shift();
	}
	this.front = function()
	{
		return collection[0];
	}
	this.empty = function()
	{
		return collection.length===0;
	}
	this.size = function()
	{
		return collection.length;
	}
	this.push = function(elem)
	{
		if(this.empty)
		{
			collection.push(elem);
		}
		else
		{
			var added = false;
			for(var i=0;i<collection.length;i++)
			{
				if(elem.f<collection[i].f)
				{
					collection.splice(i,0,elem);
				}
				added = true;
				break;
			}
			if(!added) collection.push(elem);
		}

	}
}