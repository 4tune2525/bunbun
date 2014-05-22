function log(format,msg){
	jstestdriver.console.log(format,msg);
} 

function mLog(title){
	return function(state){
		if(_.exists(title)){
			log(title+" : %o",state);
		}else{
			log("%o",state);
		}
		
		return {answer:undefined, state:state};
	};
}

AsyncTestCase("Test isArray",{

	"test should return which array is.":function(){
		var obj = {};
		var ar = [1,2,3];

		assertFalse(bbb.isArray(obj));
		assertTrue(bbb.isArray(ar));
		assertFalse(bbb.isArray(void 0));

		assertEquals({},obj);
		assertEquals([1,2,3],ar);
	}
  
});

AsyncTestCase("Test each",{

	"test should type of each's argument is object and function and context.":function(){

		var obj = {};
		var ar = [1,2,3];

		var result = [];
		var func = function(x){
			x *= 2;
			result.push(x);
		};

		assertEquals(undefined,bbb.each());
		assertEquals({},bbb.each(obj,ar));
		
		bbb.each(ar,func);
		assertEquals([2,4,6],result);
	},

	"test should each does iteration on context":function(){

		var obj = {
			func:function(x){
				if(this.result){
					this.result.push(x*2);
				}
			},

			result:[]
		};

		bbb.each([1,2,3],obj.func);

		assertNotEquals([2,4,6],obj.result);

		bbb.each([1,2,3],obj.func,obj);

		assertEquals([2,4,6],obj.result);

	}
});

AsyncTestCase("Test mapper",{

	"test should mapper needs array and function which return something as arguments.":function(){

		var obj = {};
		var ar = [1,2,3];

		var result = [];
		var iterator = function(x){
			x *= 2;
		};
		
		assertEquals([],bbb.mapper(obj,iterator));
		assertEquals([void 0,void 0,void 0],bbb.mapper(ar,iterator));
		assertException(function(){bbb.mapper(ar,obj);},"TypeError");
	},

	"test should mapper returns array by doing iteration.":function(){

		var ar = [1,2,3];

		var result = [];
		var iterator = function(x){
			x *= 2;
			return x;
		};
		var obj = {
			func:function(x){
				if(this.result){
					x += this.result;
					return  x;
				}
				return void 0;
			},
			result:3
		};
		
		assertEquals([2,4,6],bbb.mapper(ar,iterator));
		assertEquals([4,5,6],bbb.mapper(ar,obj.func,obj));

	},

	"test should return null array by mapping null.":function(){
		var ar = [];

		for(var i=0;i++;i<3){
			ar.push(void 0);
		}

		assertEquals([],ar);
	}
});

AsyncTestCase("Test reducer",{
	"test should reducer needs array and function which return something as arguments and memo(an initial value).":function(){

		var obj = {};
		var ar = [1,2,3];

		var result = [];
		var iterator = function(x){
			x *= 2;
		};
		
		assertEquals({},bbb.reducer(obj,iterator,obj));
		assertException(function(){bbb.reducer(ar,obj,obj);},"TypeError");
		assertEquals(undefined,bbb.reducer(ar,iterator));
	},

	"test should reducer returns array by doing iteration.":function(){

		var ar = [1,2,3];

		var result = [];
		var iterator = function(y,x){
			x *= 2;
			return x;
		};
		var obj = {
			func:function(x,y){
				if(this.result){
					x+= y += this.result;
					return x;
				}
				return void 0;
			},
			result:3
		};

		var memo = 1;
		
		assertEquals(6,bbb.reducer(ar,iterator,0));
		assertEquals(16,bbb.reducer(ar,obj.func,memo,obj));

	},

	"test should error that reducer do not return anything.":function(){
		
		assertEquals(undefined,bbb.reducer([1,2,3],function(){return;},0));
		
	}
});

AsyncTestCase("Test combiner",{
});


AsyncTestCase("Test partitioner",{

	"test should partitioner needs array and function which return something as arguments.":function(){


		var obj = {};
		var ar = [1,2,3];

		var func = function(x){
			x *= 2;
		};
	
		assertException(function(){bbb.partitioner(obj,func);},"TypeError");
		assertException(function(){bbb.partitioner(ar,obj);},"TypeError");
		assertNoException(function(){bbb.partitioner(ar,func);});
	},

	"test should array.sort returns no error by using function which do not return anything.":function(){

		var func = function(x){
			x*=2;
		};

		assertNoException(function(){[1,2,3].sort(func);});
	},


	"test should mapper returns array by doing iteration.":function(){
		
		var ar = [1,5,2,3,8,1];

		var compareFunc = function(x,y){
			return x < y;
		};

		bbb.partitioner(ar,compareFunc);

		assertEquals([8,5,3,2,1,1],ar);
	}
});

AsyncTestCase("actions",{
	"test should.":function(){
	}
});

AsyncTestCase("lift",{
	"test should return 3 and log -3 and 3 by using actions.":function(){

		var mNeg2 = bbb.lift(function(n){return -n;});

		assertEquals(3,bbb.actions([mNeg2(),mLog(),mNeg2(),mLog()],function(notUsed,state){return state;})(3));
	}

});

AsyncTestCase("makeTestAction",{
	"test should return 6 and log [{value:2},{value:4},{value:6},{value:8},{value:10}] and [{total:6, num:2},{total:24, num:3}], [{total:24, num:3},{total:6 ,num:2}], {total:30, num:5, avg:6}.":function(){
		
		var data = [];
		var dataBase = [1,2,3,4,5];

		for(var i=0;i<dataBase.length;i++){
			data.push({value:dataBase[i]});
		}
		
		var mapper = function(dataElm,index,data){
			dataElm.value *= 2;
			return dataElm;
		};

		var combiner = function(memo,dataElm,index,data){
			if(!_.exists(memo)){
				memo = [{total:0, num:0},{total:0, num:0}];
			}

			if(dataElm.value < 5){
				memo[0].total += dataElm.value;
				memo[0].num++;
			}else{
				memo[1].total += dataElm.value;
				memo[1].num++;
			}

			return memo;
		};

		var partitioner = _.comparator(function(x,y){
			return x.num > y.num;
		});

		var reducer = function(memo,dataElm,index,data){
			if(!_.exists(memo)){
				memo =  {total:0, num:0, avg:0};
			}

			memo.total += dataElm.total;
			memo.num += dataElm.num;
			memo.avg = memo.total/memo.num;

			return memo;
		};

		var testFunc = bbb.makeTestAction(mapper,combiner,partitioner,reducer,mLog,function(notUsed,state){return state.avg;});

		assertEquals(6,testFunc(data));
		
	}
});


AsyncTestCase("makeDoMapCombineAction",{
	"test should return [{total:6, num:2},{total:24, num:3}].":function(){
		
		var data = [];
		var dataBase = [1,2,3,4,5];

		for(var i=0;i<dataBase.length;i++){
			data.push({value:dataBase[i]});
		}
		
		var mapper = function(dataElm,index,data){
			dataElm.value *= 2;
			return dataElm;
		};

		var combiner = function(memo,dataElm,index,data){
			if(!_.exists(memo)){
				memo = [{total:0, num:0},{total:0, num:0}];
			}

			if(dataElm.value < 5){
				memo[0].total += dataElm.value;
				memo[0].num++;
			}else{
				memo[1].total += dataElm.value;
				memo[1].num++;
			}

			return memo;
		};

		var doMapCombineAction = bbb.makeDoMapCombineAction(mapper,combiner);

		assertEquals([{total:6, num:2},{total:24, num:3}],doMapCombineAction(data));
		
	}
});


AsyncTestCase("makeDoPartitionReduceAction",{
	"test should return 6 .":function(){
		
		var data = [{total:6,num:2},{total:24,num:3}];

		var partitioner = _.comparator(function(x,y){
			return x.num > y.num;
		});

		var reducer = function(memo,dataElm,index,data){
			if(!_.exists(memo)){
				memo =  {total:0, num:0, avg:0};
			}

			memo.total += dataElm.total;
			memo.num += dataElm.num;
			memo.avg = memo.total/memo.num;

			return memo;
		};

		var doPartitionReduceFunc = bbb.makeDoPartitionReduceAction(partitioner,reducer,function(notUsed,state){return state.avg;});

		assertEquals(6,doPartitionReduceFunc(data));
		
	}
});
