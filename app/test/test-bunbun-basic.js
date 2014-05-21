function log(msg){
	jstestdriver.console.log(msg);
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

		assertException(function(){bbb.each();},"TypeError");
		assertException(function(){bbb.each(ar,ar);},"TypeError");
		
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
		
		assertException(function(){bbb.mapper(obj,iterator);},"TypeError");
		assertException(function(){bbb.mapper(ar,obj);},"TypeError");
		assertException(function(){bbb.mapper(ar,iterator);},"Error");
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
		
		assertException(function(){bbb.reducer(obj,iterator,obj);},"TypeError");
		assertException(function(){bbb.reducer(ar,obj,obj);},"TypeError");
		assertException(function(){bbb.reducer(ar,iterator);},"Error");
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
		
		assertException(function(){bbb.reducer([1,2,3],function(){return;},0);},"Error");
		
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
