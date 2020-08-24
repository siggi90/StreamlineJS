app.easings = {
	init: function() {
		var NEWTON_ITERATIONS = 4;
		var NEWTON_MIN_SLOPE = 0.001;
		var SUBDIVISION_PRECISION = 0.0000001;
		var SUBDIVISION_MAX_ITERATIONS = 10;
		
		var kSplineTableSize = 11;
		var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
		
		var float32ArraySupported = typeof Float32Array === 'function';
		
		function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
		function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
		function C (aA1)      { return 3.0 * aA1; }
		
		function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }
		
		function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }
		
		function binarySubdivide (aX, aA, aB, mX1, mX2) {
		  var currentX, currentT, i = 0;
		  do {
			currentT = aA + (aB - aA) / 2.0;
			currentX = calcBezier(currentT, mX1, mX2) - aX;
			if (currentX > 0.0) {
			  aB = currentT;
			} else {
			  aA = currentT;
			}
		  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
		  return currentT;
		}
		
		function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
		 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
		   var currentSlope = getSlope(aGuessT, mX1, mX2);
		   if (currentSlope === 0.0) {
			 return aGuessT;
		   }
		   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
		   aGuessT -= currentX / currentSlope;
		 }
		 return aGuessT;
		}
		
		function LinearEasing (x) {
		  return x;
		}
		
		function bezier (mX1, mY1, mX2, mY2) {
		  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
		  }
		
		  
		
		  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
		  for (var i = 0; i < kSplineTableSize; ++i) {
			sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
		  }
		
		  function getTForX (aX) {
			var intervalStart = 0.0;
			var currentSample = 1;
			var lastSample = kSplineTableSize - 1;
		
			for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
			  intervalStart += kSampleStepSize;
			}
			--currentSample;
			
			var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
			var guessForT = intervalStart + dist * kSampleStepSize;
		
			var initialSlope = getSlope(guessForT, mX1, mX2);
			if (initialSlope >= NEWTON_MIN_SLOPE) {
			  return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
			} else if (initialSlope === 0.0) {
			  return guessForT;
			} else {
			  return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
			}
		  }
		
		  return function BezierEasing (x) {
			if (x === 0 || x === 1) {
			  return x;
			}
			return calcBezier(getTForX(x), mY1, mY2);
		  };
		}
		
		
		var bezier_function = bezier(0.13, 0.88, 0.21, 0.88);
		
		var ease_x_2 = bezier(0.68, 0.04, 0.41, 0.67);
		
		
		var s_results_easing = bezier(0.79, 0.25, 0, 0.93);
		
		var teal = bezier(1, 0.21, 0.29, 0.47);
		var ease_in_out = bezier(1, 0.2, 0.2, 0.77);
		var ease_out = bezier(0.14, 0.47, 0.02, 0.77);
		var ease_out_x = bezier(0.17, 0.62, 0, 0.97);
		var ease_out_x_2 = bezier(0.02, 1, 0, 0.97);
		var ease_out_x_3 = bezier(0.02, 1, 0.76, 0.99);
		var ease_out_x_4 = bezier(0.64, 0.14, 0.23, 0.73);
		var ease_out_x_5 = bezier(0.76, 0.36, 0.26, 0.66);
		var ease_out_x_6 = bezier(0.31, 0.76, 0.35, 0.68);
		var ease_out_x_7 = bezier(0.09, 0.84, 0.48, 0.97);
		
		$.extend($.easing,
		{
			ease_x: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*bezier_function(t/=d)+b; 
			},
			ease_x_2: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*ease_x_2(t/=d)+b; 
			},
			x_results_easing: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*s_results_easing(t/=d)+b; 
			},
			teal: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*teal(t/=d)+b; 
			},
			ease_in_out: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*ease_in_out(t/=d)+b; 
			},
			ease_out: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*ease_out(t/=d)+b; 
			},
			ease_out_x: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*ease_out_x(t/=d)+b; //t/=d 
			},
			ease_out_x_2: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*ease_out_x_2(t/=d)+b; 
			},
			ease_out_x_3: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*ease_out_x_3(t/=d)+b; 
			},
			ease_out_x_4: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*ease_out_x_4(t/=d)+b; 
			},
			ease_out_x_5: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*ease_out_x_5(t/=d)+b; 
			},
			ease_out_x_6: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*ease_out_x_6(t/=d)+b; 
			},
			ease_out_x_7: function (x, t, b, c, d) {
			   //return c*(t/=d)*t + b;
			   return c*ease_out_x_7(t/=d)+b; 
			},
			ease_in_out_x: function (x, t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*Math.pow(t, 1.5) + b;
				return c/2*((t-=2)*Math.pow(t, 1.5) + 2) + b;
			}
		});
	}
};