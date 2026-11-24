import { Pass } from "postprocessing";
import * as THREE from "three";

/**
 * OutputPass: Final pass in the EffectComposer chain.
 * Performs Khronos PBR Neutral Tone Mapping and Linear-to-sRGB Color Space Transfer.
 * Renders directly to the canvas / display framebuffer.
 */
export class OutputPass extends Pass {
  private material: THREE.ShaderMaterial;

  constructor() {
    super("OutputPass");
    this.needsSwap = true;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        // Khronos PBR Neutral Tone Mapping
        vec3 NeutralToneMapping(vec3 color) {
          const float startCompression = 0.8 - 0.04;
          const float desaturation = 0.15;
          float x = min(color.r, min(color.g, color.b));
          float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
          color -= offset;
          float peak = max(color.r, max(color.g, color.b));
          if (peak < startCompression) return color;
          const float d = 1.0 - startCompression;
          float newPeak = 1.0 - d * d / (peak + d - startCompression);
          color *= newPeak / peak;
          float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
          return mix(color, vec3(newPeak), g);
        }

        // Linear to sRGB Transfer Function
        vec3 LinearToSRGB(vec3 c) {
          c = clamp(c, 0.0, 1.0);
          return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
        }

        void main() {
          vec4 tex = texture2D(tDiffuse, vUv);
          vec3 mapped = NeutralToneMapping(tex.rgb);
          vec3 srgb = LinearToSRGB(mapped);
          gl_FragColor = vec4(srgb, tex.a);
        }
      `,
      depthTest: false,
      depthWrite: false,
    });

    this.fullscreenMaterial = this.material;
  }

  render(renderer: THREE.WebGLRenderer, inputBuffer: any, outputBuffer: any) {
    this.material.uniforms.tDiffuse.value = inputBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
    renderer.render(this.scene, this.camera);
  }
}
