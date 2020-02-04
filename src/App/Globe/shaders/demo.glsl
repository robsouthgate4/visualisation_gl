

#define GLSLIFY 1

vec4 permute(vec4 x) {  return mod(((x*34.0)+1.0)*x, 289.0);    }
vec4 taylorInvSqrt(vec4 r) {    return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;
    
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

float snoise(float x, float y, float z){
        return snoise(vec3(x, y, z));
}

uniform float time;
uniform float noiseStrength;
uniform float noiseOffset;
uniform float numSeg;
uniform float range;
uniform float scale;
uniform vec3 viewPosition;


varying vec3 vNormal;
varying vec3 eye;

const float PI = 3.141592653;

//  FOR INTERACTION
uniform vec3 rippleCenter[10];
uniform float waveHeight[10];
uniform float waveFront[10];
uniform float waveLength[10];

mat4 rotationMatrix(vec3 axis, float angle)
{
        axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

const vec3 YAXIS = vec3(0.0, 1.0, 0.0);

vec3 getPosition(vec3 values) {

    float rx = values.y / numSeg * PI - PI;
    float ry = values.x / numSeg * PI * 2.0;

    vec3 pos = vec3(0.0);
    pos.y = cos(rx) * values.z;
    float r = sin(rx) * values.z;
    pos.x = cos(ry) * r;
    pos.z = sin(ry) * r;
    return pos;
    
} 

vec3 getPosition(float i, float j, float r) {
       return getPosition(vec3(i, j, r*scale));
} 


vec3 getWaveHeight(vec3 pos, vec3 rCenter, float wH, float wF, float wL) {
        float dist = distance(pos, rCenter);
    float distWave = distance(dist, wF);
    float rOffset = 0.0;
    if(distWave < wL) {
    
        float t = (dist - wF + wL)/wL; // 0 ~ waveLength * 2.0;
        rOffset = -cos(t*PI) + 1.0;
    }

    // rOffset = smoothstep(0.0, 1.0, rOffset);

    vec3 tmpPos = normalize(pos) * noiseStrength;
    return tmpPos * rOffset * wH;
}

vec3 getFinalPos(vec3 pos) {
        vec3 touchRipple = vec3(0.0); 
    for(int i=0; i<10; i++) {
            touchRipple += getWaveHeight(pos, rippleCenter[i], waveHeight[i], waveFront[i], waveLength[i]);
    }

    vec3 noisePos = pos * noiseOffset;
    vec3 tmpPos = normalize(pos) * noiseStrength;
    vec3 posOffset = tmpPos * snoise(noisePos.x + time, noisePos.y + time, noisePos.z + time);
    return pos + posOffset*range + touchRipple;
}

void main() {
    
    vec3 pos = getPosition(position.x, position.y, position.z);
    vec3 p0  = getPosition(position.x+1.0, position.y, position.z);
    vec3 p1  = getPosition(position.x, position.y+1.0, position.z);

    // vec3 posRippleCenter = rippleCenter;
    
    vec3 finalPos  = getFinalPos(pos);
    vec3 finalPos0 = getFinalPos(p0);
    vec3 finalPos1 = getFinalPos(p1);
    
    vec3 v0 = finalPos0 - finalPos;
    vec3 v1 = finalPos1 - finalPos;
    
    

    if(length(v0) == 0.0) {
            float gap = .01;

        if(position.y < 1.0) {
                pos = getPosition(position.x, position.y+gap, position.z);
            p0  = getPosition(position.x+1.0, position.y+gap, position.z);
        } else {
                pos = getPosition(position.x, position.y-gap, position.z);
            p0  = getPosition(position.x+1.0, position.y-gap, position.z);
        }

        vec3 newP = getFinalPos(pos);
        vec3 newP0 = getFinalPos(p0);
        v0 = newP0 - newP;
    } 

    vec3 vCross = cross(v1, v0);

    // mat3 nMtx = normalMatrix;

    vec4 mvPosition = modelViewMatrix * vec4( finalPos, 1.0);
    gl_Position     = projectionMatrix * mvPosition;
    vNormal         = normalize( normalMatrix * vCross );
    eye             = normalize( mvPosition.rgb );
    // gl_Position = projectionMatrix * modelViewMatrix * vec4( finalPos, 1.0 ); 
}



#define GLSLIFY 1
varying vec3 vNormal;
varying vec3 eye;

uniform sampler2D tLight;
uniform float exportNormal;

void main() {
    vec3 color = vNormal;

vec3 r = reflect( eye, vNormal );
    float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
    vec2 vN = r.xy / m + .5;

    vec3 baseLight = texture2D( tLight, vN ).rgb;
    
    gl_FragColor = vec4( baseLight, 1. );
    if(exportNormal > 0.0) {
            color = vNormal * .5 + vec3(.5);
    gl_FragColor = vec4( color, 1.0);\t
    }
};