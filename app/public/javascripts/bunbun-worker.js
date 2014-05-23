onmessage = function(event){
	postMessage(bbb.mapper(event.data.charge,event.data.charge.mapper));
};
