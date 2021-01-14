import { App } from './app';
import vxCode from './shader/vertex.glsl';
import fxCode from './shader/fragment.glsl'
import { PerspectiveCamera, Matrix4, Vector3, Color } from 'three';
import crateGIF from './texture/crate.gif';

const cubeVertexPosition = new Float32Array( [

            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,

] );

const cubeVertexUV = new Float32Array( [

          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,

          // Back face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Top face
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,

          // Bottom face
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,

          // Right face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Left face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,

] );

const cubeIndex = new Uint32Array( [
    
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face

 ] );

const cubeMVMatrix = new Matrix4();

const cubeVertexNormals = new Float32Array( [
    // Front face
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back face
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top face
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom face
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // Right face
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Left face
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
] );


let main = async () => {

    let backgroundColor = { r: 0, g: 0, b: 0, a: 1.0 };

    let app = new App();

    let canvasLayer = document.getElementById( 'canvasLayer' );

    let camera = new PerspectiveCamera( 45, canvasLayer.clientWidth / canvasLayer.clientHeight, 0.1, 100 );

    let pMatrix = camera.projectionMatrix;

    app.CreateCanvas( canvasLayer )

    .then( ( { width, height } ) => {

        return app.InitWebGPU( width, height );

    })

    .then( ( { colorAttachment, depthStencilAttachment } ) => {

        app.InitRenderPass( backgroundColor, colorAttachment, depthStencilAttachment )

        app.InitPipelineWitMultiBuffers( vxCode, fxCode );

        return app.LoadTexture( crateGIF )

        .then( ( texture ) => {

            return { texture, colorAttachment, depthStencilAttachment };

        } );
    
    } )

    .then( ( { texture, colorAttachment, depthStencilAttachment } ) => {

        let lastTime = 0, z = -5.0, xSpeed = 0, ySpeed = 0, xRot = 0, yRot = 0, samplerIndex = 0;

        app.AddKeyboardEventListener( 'keyup', 'f', () => {

            if ( samplerIndex === 2 ) {

                samplerIndex = 0

            } else {

                samplerIndex ++

            }

        } );

        app.AddKeyboardEventListener( 'keydown', 'PageUp', () => z += 0.05 );

        app.AddKeyboardEventListener( 'keydown', 'PageDown', () => z -= 0.05 );

        app.AddKeyboardEventListener( 'keydown', 'ArrowUp', () => xSpeed -= 1 );

        app.AddKeyboardEventListener( 'keydown', 'ArrowDown', () => xSpeed += 1 );

        app.AddKeyboardEventListener( 'keydown', 'ArrowLeft', () => ySpeed -= 1 );

        app.AddKeyboardEventListener( 'keydown', 'ArrowRight', () => ySpeed += 1 );

        app.AddKeyboardEventListener( 'keyup', 'r', () => {

            lastTime = 0;
            z = -5.0;
            xSpeed = 0;
            ySpeed = 0;
            xRot = 0;
            yRot = 0;
            samplerIndex = 0;

        } );

        let animate = () => {
    
            let timeNow = new Date().getTime();
    
            if ( lastTime != 0 ) {
    
                let elapsed = timeNow - lastTime;
         
                xRot += ( Math.PI / 180 * xSpeed * elapsed ) / 1000.0;
                yRot += ( Math.PI / 180 * ySpeed * elapsed ) / 1000.0;
            }
    
            lastTime = timeNow;

        }

        let makePositionUniformArray = ( ifUseLighting: boolean, mvMatrix: Matrix4, ambientColor: Color, uLightingDirection: Vector3, directionalColor: Color  ) => {

            let clone = mvMatrix.clone();

            clone.getInverse( clone ).transpose();

            let result = new Float32Array( [ Number( ifUseLighting ), ...clone.toArray(), ...ambientColor.toArray(), ...uLightingDirection.normalize().toArray(), ...directionalColor.toArray() ] );

            return result;

        }

        app.RunRenderLoop( () => {
    
            animate();
    
            app.InitRenderPass( backgroundColor, colorAttachment, depthStencilAttachment );
    
            app.renderPassEncoder.setPipeline( app.renderPipeline );
                
            cubeMVMatrix.makeTranslation( 0, 0, z )
                .multiply( new Matrix4().makeRotationX( xRot ) )
                .multiply( new Matrix4().makeRotationY( yRot ) );
        
            let positionUniformArray = new Float32Array( pMatrix.toArray().concat( cubeMVMatrix.toArray() ) );

            let lightUniformArray = makePositionUniformArray( true, cubeMVMatrix, new Color( 0xffffff ), new Vector3( 0, -1, 0 ), new Color( 0xff0000 ) );
                    
            app.InitGPUBufferWithMultiBuffers( cubeVertexPosition, cubeVertexUV, cubeVertexNormals, positionUniformArray, lightUniformArray, cubeIndex, texture, app.samplers[ samplerIndex ] );
    
            app.DrawIndexed( cubeIndex.length );
    
            app.Present();
        
        } );

    })

}

window.addEventListener( 'DOMContentLoaded', main );