class PlanetView {
    
    constructor() {
        this.hash = [];
        this.data = '';
        
        this.width = 700;
        this.height = 700;

        this.patterns = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        this.colors = [
            "#FFFD00",
            "#FEB900",
            "#EFA288",
            "#EEA5B0",
            "#FF99D6",
            "#DD9278",
            "#FC8F79",
            "#E45641",
            "#E62D38",
            "#F94A62",
            "#EB526F",
            "#FF54B0",
            "#FA198C",
            "#C5147D",
            "#E1A9E8",
            "#9B5FE5",
            "#7C00C7",
            "#531CB3",
            "#CCFF66",
            "#00E291",
            "#35D1BF",
            "#028A81",
            "#0A3748",
            "#4F51B3",
            "#1D00FF",
            "#090080",
            "#0A104D",
            "#575756"
        ];
    }

    setData( data, size = 700 ) { 
        
        if ( data == null ) data = "";
        this.hash = this.hexToBytes( this.sha256( data ));
        
        return this.createCanvas(this.hash, size);
    }

    hexToBytes( hex ) { 
        
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));

        return bytes;
    }

    createCanvas( hash, size ) { 
		const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.height = size;

        ctx.beginPath();

        this.onDraw(ctx, hash);
        
        return canvas;
	}

    getValueFromByte( input, range ) { 
        let inputInt = ( input & 0xFF ); 
        if ( range == 0 ) return 0;
        let percent = 256 / parseFloat(range);
        for ( let i = 0; i < range; i++ ) {
            if ( ( parseFloat(i) * percent ) < inputInt && inputInt < ( parseFloat( i + 1 ) * percent ) ) {
                return i;
            }
        }
        return 0;
    }

    onDraw( canvas, hash ) {
        
        { // Circle Clip  
            let path = new Path2D();
            path.arc( this.width / 2.0, this.height / 2.0, this.height / 2.0, 0, Math.PI * 2 )
            canvas.clip(path);
        }

        { // Mask Circle 
            let visible = this.getValueFromByte( hash[ 24 ], 10 ) <= 5;
            if ( visible ) {
                let outlineRadius = 30.0 + this.getValueFromByte( hash[ 25 ], 90 ) * 0.5;
                let degree = this.getValueFromByte( hash[ 26 ], 360 );
                let scale = 60.0 + this.getValueFromByte( hash[ 27 ], 80 ) * 0.5;
                this.drawMaskCircle( canvas, outlineRadius, degree, scale );
            }
        }

        { // Main 
            let pattern = this.patterns[ this.getValueFromByte( hash[ 0 ], this.patterns.length ) ];
            let colorCode = this.colors[ this.getValueFromByte( hash[ 1 ], this.colors.length ) ];
            this.drawMain( canvas, pattern, colorCode);
        }

        { // Circle 1  
            let visible = this.getValueFromByte( hash[ 8 ], 10 ) <= 9;
            if ( visible ) {
                let outlineRadius = 90.0 + this.getValueFromByte( hash[ 9 ], 40 ) * 0.5;
                let degree = this.getValueFromByte( hash[ 10 ], 360 );
                let scale = 90.0 + this.getValueFromByte( hash[ 11 ], 40 ) * 0.5;
                let colorCode = this.colors[ this.getValueFromByte( hash[ 12 ], this.colors.length ) ];
                this.drawCircle( canvas, outlineRadius, degree, scale, colorCode );
            }
        }

        { // Circle 2   
            let visible = this.getValueFromByte( hash[ 16 ], 10 ) <= 7;
            if ( visible ) {
                let outlineRadius = 90.0 + this.getValueFromByte( hash[ 17 ], 40 ) * 0.5;
                let degree = this.getValueFromByte( hash[ 18 ], 360 );
                let scale = 90.0 + this.getValueFromByte( hash[ 19 ], 40 ) * 0.5;
                let colorCode = this.colors[ this.getValueFromByte( hash[ 20 ], this.colors.length ) ];
                this.drawCircle( canvas, outlineRadius, degree, scale, colorCode );
            }
        }
    }

    drawMaskCircle(  canvas,  outlineRadius,  degree,  scale ) {

        let maskCircle = new Path2D();
        maskCircle.rect(0, 0, this.width, this.height);

        maskCircle.arc(
            this.width / 2.0 + parseFloat(( outlineRadius / 100.0 * ( this.width / 2.0 ) * Math.cos( degree * Math.PI / 180.0 ) )),
            this.height / 2.0 + parseFloat(( outlineRadius / 100.0 * ( this.width / 2.0 ) * Math.sin( degree * Math.PI / 180.0 ) )),
            parseFloat( scale ) / 100.0 * ( this.width / 2.0 ), 
            0, Math.PI * 2 )

        canvas.clip(maskCircle, "evenodd");
    }

    drawCircle( canvas,  outlineRadius,  degree,  scale,  colorCode ) {

        let Circle = new Path2D();

        Circle.arc( 
            this.width / 2.0 + parseFloat( ( outlineRadius / 100.0 * ( this.width / 2.0 ) * Math.cos( degree * Math.PI / 180.0 )) ),
            this.width / 2.0 + parseFloat( ( outlineRadius / 100.0 * ( this.width / 2.0 ) * Math.sin( degree * Math.PI / 180.0 )) ),
            parseFloat( scale ) / 100.0 * ( this.width / 2.0 ),
            0, Math.PI * 2 )
        
        canvas.fillStyle = colorCode;
        canvas.fill(Circle);
    }

    drawMain( canvas, pattern, colorCode ) {
        console.log(pattern)
        if ( pattern == 0 ) { // patttern 0 ( None )
            canvas.fillStyle = colorCode;
            canvas.fillRect( 0, 0, this.width, this.height );
        }

        if ( pattern == 1 ) { // Pattern 1 ( Wave )
            let waveWidth = this.width / 16; 
            let waveHeight = this.height / 42; 
            let waveCount =  Math.ceil( this.width / waveWidth ); 
            let pathCount =  Math.ceil( this.height / waveHeight ); 

            canvas.lineWidth = this.height / 42 ; 
            canvas.strokeStyle = colorCode;

            for ( let j = 0; j < pathCount + 1; j++ ) {
                let pointY = j * waveHeight * 2;  
                canvas.moveTo( -waveWidth, pointY + waveHeight ); 
                for ( let i = 0; i < waveCount + 1; i++ ) {
                    canvas.quadraticCurveTo( ( i * waveWidth * 4 ) + waveWidth * 0, pointY - waveHeight + waveHeight / 2.0, ( i * waveWidth * 4 ) + waveWidth * 1, pointY + waveHeight / 2.0 );
                    canvas.quadraticCurveTo( ( i * waveWidth * 4 ) + waveWidth * 2, pointY + waveHeight + waveHeight / 2.0, ( i * waveWidth * 4 ) + waveWidth * 3, pointY + waveHeight / 2.0 );
                    canvas.stroke();
                }
            }
        }

        if ( pattern == 2 ) { // Pattern 2 ( Diamond )
            let pathWidth =  parseFloat( Math.sqrt( Math.pow( this.width, 2 ) + Math.pow( this.height, 2 ) ) / 42.0 ); 

            let centerX = this.width / 2.0; 
            let centerY = this.height / 2.0; 
            
            canvas.lineWidth = pathWidth;
            canvas.strokeStyle = colorCode;
            canvas.fillStyle = colorCode;

            for ( let i = 0; i < 14; i++ ) {
                let multi = i == 0 ? 1 : ( i * 3 );
                canvas.beginPath();
                canvas.moveTo( centerX, centerY - pathWidth * multi );
                canvas.lineTo( centerX + pathWidth * multi, centerY );
                canvas.lineTo( centerX, centerY + pathWidth * multi );
                canvas.lineTo( centerX - pathWidth * multi, centerY );
                canvas.closePath();
                if ( i == 0 ) {
                    canvas.fill();
                } else {
                    canvas.stroke();
                }
            }
        }

        if ( pattern == 3 ) {   // Pattern 3 ( Stripe(vertical) )
            let pathWidth = this.width / 56;
            canvas.lineWidth = pathWidth * 2 ;
            canvas.strokeStyle = colorCode;

            for ( let i = 0; i < 28; i++ ) {
                canvas.moveTo( pathWidth * ( i * 4 + 1 ), 0 );
                canvas.lineTo( pathWidth * ( i * 4 + 1 ), this.height );
                canvas.stroke();
            }
        }

        if ( pattern == 4 ) {   // Pattern 4 ( Stripe twist )
            let pathWidth = this.width / 56;
            canvas.lineWidth = pathWidth * 2;
            canvas.strokeStyle = colorCode;

            for ( let i = 0; i < 28; i++ ) {
                
                canvas.moveTo( pathWidth * ( i * 4 + 1 ), 0 );   
                canvas.lineTo( pathWidth * ( i * 4 + 1 ), this.height / 2.0 );
                canvas.stroke();
                
                canvas.moveTo( pathWidth * ( i * 4 + 3 ), this.height / 2.0 );
                canvas.lineTo( pathWidth * ( i * 4 + 3 ), this.height );
                canvas.stroke();
            }
        }

        if ( pattern == 5 ) {  // Pattern 5 ( diagonal )
            let pathWidth = Math.sqrt( Math.pow( this.width, 2 ) + Math.pow( this.height, 2 ) ) / 42.0;
            canvas.lineWidth = pathWidth;
            canvas.strokeStyle = colorCode;

            for ( let i = 0; i < 24; i++ ) {
                canvas.moveTo( this.width + pathWidth - ( ( i - 12 ) * 3 ) * pathWidth, -pathWidth );
                canvas.lineTo( 0 - pathWidth - ( ( i - 12 ) * 3 ) * pathWidth, this.height + pathWidth );
                canvas.stroke();
            }
        }

        if ( pattern == 6 ) { // Pattern 6 ( Check ) 
            canvas.fillStyle = colorCode; 

            let boxWidth = this.width / 24.0;
            for ( let j = 0; j < 12; j++ ) {
                for ( let i = 0; i < 12; i++ ) {
                    canvas.fillRect( 
                        boxWidth * ( i * 2 ),  
                        boxWidth * ( j * 2 ),  
                        boxWidth,              
                        boxWidth);             
                    canvas.fillRect( 
                        boxWidth * ( i * 2 + 1 ), 
                        boxWidth * ( j * 2 + 1), 
                        boxWidth, 
                        boxWidth);
                }
            }
        }

        if ( pattern == 7 ) { // Pattern 7 ( Check )  
            canvas.strokeStyle = colorCode;

            let patternWidth = this.width / 32.0;
            let patternHeight = this.height / 8.0;
            let patternDiagonal =  Math.sqrt( Math.pow( patternWidth, 2 ) );

            for ( let j = 0; j < 5; j++ ) {
                for ( let i = 0; i < 16; i++ ) {
                    canvas.moveTo( patternWidth * ( i * 2 ), patternHeight * ( j * 2 ) + -patternHeight / 2.0 );
                    canvas.lineTo( patternWidth * ( i * 2 + 1 ), patternHeight * ( j * 2 ) - patternHeight / 2.0 + patternDiagonal );
                    canvas.lineTo( patternWidth * ( i * 2 + 1 ), patternHeight * ( j * 2 ) - patternHeight / 2.0 + patternHeight + patternDiagonal );
                    canvas.lineTo( patternWidth * ( i * 2 ), patternHeight * ( j * 2 ) - patternHeight / 2.0 + patternHeight );
                    canvas.fillStyle = colorCode; 
                    canvas.fill();

                    canvas.moveTo( patternWidth * ( i * 2 + 1 ), patternHeight * ( j * 2 ) - patternHeight / 2.0 + patternHeight + patternDiagonal );
                    canvas.lineTo( patternWidth * ( i * 2 + 2 ), patternHeight * ( j * 2 ) - patternHeight / 2.0 + patternHeight );
                    canvas.lineTo( patternWidth * ( i * 2 + 2 ), patternHeight * ( j * 2 ) - patternHeight / 2.0 + patternHeight + patternHeight );
                    canvas.lineTo( patternWidth * ( i * 2 + 1 ), patternHeight * ( j * 2 ) - patternHeight / 2.0 + patternHeight + patternHeight + patternDiagonal );
                    canvas.stroke();

                }
            }
        }

        if ( pattern == 8 ) { // Pattern 8 ( grill ) 
            canvas.fillStyle = colorCode; 

            let pathWidth = ( this.width / 16.0 ) * 3.0 / 5.0;
            let gapWidth = ( this.width / 16.0 ) * 2.0 / 5.0;

            for ( let j = 0; j < 18; j++ ) {
                for ( let i = 0; i < 18; i++ ) {
                    canvas.moveTo( ( gapWidth * ( i + 1 ) ) + ( pathWidth * i ) + ( ( pathWidth / 2.0 ) * 1 ) - gapWidth / 2.0, +( ( pathWidth / 2.0 ) * -1 ) + ( gapWidth + pathWidth ) * j );
                    canvas.lineTo( ( gapWidth * ( i + 1 ) ) + ( pathWidth * i ) + ( ( pathWidth / 2.0 ) * 2 ) - gapWidth / 2.0, +( ( pathWidth / 2.0 ) * 0 ) + ( gapWidth + pathWidth ) * j );
                    canvas.lineTo( ( gapWidth * ( i + 1 ) ) + ( pathWidth * i ) + ( ( pathWidth / 2.0 ) * 1 ) - gapWidth / 2.0, +( ( pathWidth / 2.0 ) * 1 ) + ( gapWidth + pathWidth ) * j );
                    canvas.lineTo( ( gapWidth * ( i + 1 ) ) + ( pathWidth * i ) + ( ( pathWidth / 2.0 ) * 0 ) - gapWidth / 2.0, +( ( pathWidth / 2.0 ) * 0 ) + ( gapWidth + pathWidth ) * j );
                    canvas.fill();

                    canvas.moveTo( ( gapWidth * ( i + 1 ) ) + ( pathWidth * i ) + ( ( pathWidth / 2.0 ) * 1 ) - gapWidth - pathWidth / 2.0, ( gapWidth / 2.0 + pathWidth / 2.0 ) + ( ( pathWidth / 2.0 ) * -1 ) + ( gapWidth + pathWidth ) * j );
                    canvas.lineTo( ( gapWidth * ( i + 1 ) ) + ( pathWidth * i ) + ( ( pathWidth / 2.0 ) * 2 ) - gapWidth - pathWidth / 2.0, ( gapWidth / 2.0 + pathWidth / 2.0 ) + ( ( pathWidth / 2.0 ) * 0 ) + ( gapWidth + pathWidth ) * j );
                    canvas.lineTo( ( gapWidth * ( i + 1 ) ) + ( pathWidth * i ) + ( ( pathWidth / 2.0 ) * 1 ) - gapWidth - pathWidth / 2.0, ( gapWidth / 2.0 + pathWidth / 2.0 ) + ( ( pathWidth / 2.0 ) * 1 ) + ( gapWidth + pathWidth ) * j );
                    canvas.lineTo( ( gapWidth * ( i + 1 ) ) + ( pathWidth * i ) + ( ( pathWidth / 2.0 ) * 0 ) - gapWidth - pathWidth / 2.0, ( gapWidth / 2.0 + pathWidth / 2.0 ) + ( ( pathWidth / 2.0 ) * 0 ) + ( gapWidth + pathWidth ) * j );
                    canvas.fill();
                }
            }
        }


        if ( pattern == 9 ) { // Pattern 9 ( half ) 
            let pathWidth =  Math.sqrt( Math.pow( this.width, 2 ) + Math.pow( this.height, 2 ) ) / 42.0;
            
            canvas.lineWidth = pathWidth;
            canvas.fillStyle = colorCode;

            for ( let i = 0; i < 13; i++ ) {
                canvas.moveTo( this.width + pathWidth + ( ( i - 12 ) * 3 ) * pathWidth - pathWidth * 2, -pathWidth );
                canvas.lineTo( 0 - pathWidth + ( ( i - 12 ) * 3 ) * pathWidth - pathWidth * 2, this.height + pathWidth );
                canvas.strokeStyle = colorCode; 
                canvas.stroke();
            }

            canvas.moveTo( this.width, 0 );
            canvas.lineTo( this.width, this.height );
            canvas.lineTo( 0, this.height );
            canvas.fill();
        }


        if ( pattern == 10 ) { // Pattern 10 ( Zigzag )
            let patternWidth = this.width / 16.0;
            let patternHeight = this.height / 16.0;
            canvas.fillStyle = colorCode; 

            for ( let i = 0; i < 8; i++ ) {
                
                canvas.moveTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 0 + patternHeight * 0 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 2, ( patternHeight * 4 ) * 0 + patternHeight * 0 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 0 + patternHeight * 1 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 2, ( patternHeight * 4 ) * 0 + patternHeight * 2 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 0 + patternHeight * 3 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 2, ( patternHeight * 4 ) * 0 + patternHeight * 4 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 0 + patternHeight * 4 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 0 + patternHeight * 3 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 0 + patternHeight * 2 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 0 + patternHeight * 1 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 0 + patternHeight * 0 );
                canvas.fill();

                canvas.moveTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 1 + patternHeight * 0 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 1 + patternHeight * 0 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 2, ( patternHeight * 4 ) * 1 + patternHeight * 1 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 1 + patternHeight * 2 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 2, ( patternHeight * 4 ) * 1 + patternHeight * 3 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 1 + patternHeight * 4 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 1 + patternHeight * 4 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 1 + patternHeight * 3 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 1 + patternHeight * 2 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 1 + patternHeight * 1 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 1 + patternHeight * 0 );
                canvas.fill();

                canvas.moveTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 2 + patternHeight * 0 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 2, ( patternHeight * 4 ) * 2 + patternHeight * 0 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 2 + patternHeight * 1 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 2, ( patternHeight * 4 ) * 2 + patternHeight * 2 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 2 + patternHeight * 3 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 2, ( patternHeight * 4 ) * 2 + patternHeight * 4 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 2 + patternHeight * 4 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 2 + patternHeight * 3 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 2 + patternHeight * 2 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 2 + patternHeight * 1 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 2 + patternHeight * 0 );
                canvas.fill();

                canvas.moveTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 3 + patternHeight * 0 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 3 + patternHeight * 0 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 2, ( patternHeight * 4 ) * 3 + patternHeight * 1 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 3 + patternHeight * 2 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 2, ( patternHeight * 4 ) * 3 + patternHeight * 3 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 3 + patternHeight * 4 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 3 + patternHeight * 4 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 3 + patternHeight * 3 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 3 + patternHeight * 2 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 1, ( patternHeight * 4 ) * 3 + patternHeight * 1 );
                canvas.lineTo( ( patternWidth * 2 * i ) + patternWidth * 0, ( patternHeight * 4 ) * 3 + patternHeight * 0 );
                canvas.fill();
            }
        }

        if ( pattern == 11 ) { // Pattern 11 ( triangle )  
            let patternWidth = this.width / 12.0;
            canvas.fillStyle = colorCode; 

            for ( let j = 0; j < 12; j++ ) {
                for ( let i = 0; i < 12; i++ ) {
                    canvas.moveTo( patternWidth * i, patternWidth * j );
                    canvas.lineTo( patternWidth * ( i + 1 ), patternWidth * j );
                    canvas.lineTo( patternWidth * i, patternWidth * ( j + 1 ) );
                    canvas.fill();
                }
            }
        }

        if ( pattern == 12 ) {   // Pattern 12 ( Stripe(horizontal) )
            let pathWidth = this.width / 56;
            canvas.lineWidth = pathWidth * 2;
            canvas.strokeStyle = colorCode;

            for ( let i = 0; i < 28; i++ ) {
                canvas.moveTo( 0, pathWidth * ( i * 4 + 1 ) );
                canvas.lineTo( this.width, pathWidth * ( i * 4 + 1 ) );
                canvas.stroke();
            }
        }
    }

    sha256( s ){
		var chrsz  = 8;
		var hexcase = 0;
		function safe_add (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
		}
		function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
		function R (X, n) { return ( X >>> n ); }
		function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
		function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
		function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
		function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
		function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
		function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }
		function core_sha256 (m, l) {
            var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
            var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
            var W = new Array(64);
            var a, b, c, d, e, f, g, h, i, j;
            var T1, T2;
            m[l >> 5] |= 0x80 << (24 - l % 32);
            m[((l + 64 >> 9) << 4) + 15] = l;
            for ( var i = 0; i<m.length; i+=16 ) {
                a = HASH[0];
                b = HASH[1];
                c = HASH[2];
                d = HASH[3];
                e = HASH[4];
                f = HASH[5];
                g = HASH[6];
                h = HASH[7];
                for ( var j = 0; j<64; j++) {
                    if (j < 16) W[j] = m[j + i];
                    else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
                    T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                    T2 = safe_add(Sigma0256(a), Maj(a, b, c));
                    h = g;
                    g = f;
                    f = e;
                    e = safe_add(d, T1);
                    d = c;
                    c = b;
                    b = a;
                    a = safe_add(T1, T2);
                }
                HASH[0] = safe_add(a, HASH[0]);
                HASH[1] = safe_add(b, HASH[1]);
                HASH[2] = safe_add(c, HASH[2]);
                HASH[3] = safe_add(d, HASH[3]);
                HASH[4] = safe_add(e, HASH[4]);
                HASH[5] = safe_add(f, HASH[5]);
                HASH[6] = safe_add(g, HASH[6]);
                HASH[7] = safe_add(h, HASH[7]);
            }
		    return HASH;
        }
        
		function str2binb (str) {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for ( var i = 0; i < str.length * chrsz; i += chrsz ) {
                bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
            }
            return bin;
        }

		function Utf8Encode(string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
		        else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
		}
		    return utftext;
		}
		function binb2hex (binarray) {
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
                for(var i = 0; i < binarray.length * 4; i++) {
                    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
                    hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8 )) & 0xF);
                }
                return str;
            }
            s = Utf8Encode(s);
            return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
       }
}
export default new PlanetView();