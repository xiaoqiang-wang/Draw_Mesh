#version 330 core
precision mediump float;

// Interpolated values from the vertex shaders
in vec2 UV;
in vec3 Position_worldspace;
in vec3 Normal_cameraspace;
in vec3 EyeDirection_cameraspace;
in vec3 LightDirection_cameraspace;


// Ouput data
out vec4 color;


// Values that stay constant for the whole mesh.
uniform sampler2D myTextureSampler;

uniform mat4 MV;
uniform vec3 LightPosition_worldspace;
uniform vec3 MaterialAmbient;
uniform vec3 MaterialDiffuse;
uniform vec3 MaterialSpecular;

uniform vec3 LightColor; 
uniform float LightPower;

void main(){

	// Light emission properties
	// You probably want to put them as uniforms
	// vec3 LightColor = vec3(0.9, 0.9, 0.9);
    // float LightPower = 40.0f;


	// Material properties
	vec3 MaterialDiffuseColor  = MaterialDiffuse + texture( myTextureSampler, UV ).rgb;
	vec3 MaterialAmbientColor  = MaterialAmbient + vec3(0.5,0.5,0.5) * MaterialDiffuseColor;
	vec3 MaterialSpecularColor = MaterialSpecular;

	// Distance to the light
	float distance = length(LightPosition_worldspace - Position_worldspace );

	// Normal of the computed fragment, in camera space
	vec3 n = normalize( Normal_cameraspace );


	// Direction of the light (from the fragment to the light)
	vec3 l = normalize( LightDirection_cameraspace );


	// Cosine of the angle between the normal and the light direction,
	// clamped above 0
	//  - light is at the vertical of the triangle -> 1
	//  - light is perpendicular to the triangle -> 0
	//  - light is behind the triangle -> 0
	float cosTheta = clamp( dot( n,l ), 0.0, 1.0 );

	// Eye vector (towards the camera)
	vec3 E = normalize(EyeDirection_cameraspace);


	// Direction in which the triangle reflects the light
	vec3 R = reflect(-l,n);


	// Cosine of the angle between the Eye vector and the Reflect vector,
	// clamped to 0
	//  - Looking into the reflection -> 1
	//  - Looking elsewhere -> < 1
	float cosAlpha = clamp( dot( E,R ), 0.0, 1.0 );

	vec3 t_color = 
		// Ambient : simulates indirect lighting
		MaterialAmbientColor +

		// Diffuse : "color" of the object
		MaterialDiffuseColor * LightColor * LightPower * cosTheta / (distance*distance) +

		// Specular : reflective highlight, like a mirror
		MaterialSpecularColor * LightColor * LightPower * pow(cosAlpha, 5.0) / (distance*distance);

	//color = vec4(t_color.xyz, 0.0);
	color = vec4(t_color.xyz, 1.0);
	

	vec3 t_Ambient  = MaterialAmbientColor;
	vec3 t_Diffuse  = MaterialDiffuseColor * LightColor * LightPower * cosTheta / (distance*distance);
	vec3 t_Specular = MaterialSpecularColor * LightColor * LightPower * pow(cosAlpha, 5.0) / (distance*distance);

	//color = vec4(texture(myTextureSampler, UV ).rgb, 1.0)+clamp(vec4(t_color.xyz, 0.0),vec4(0.0f), vec4(0.0f));

	//color = vec4(t_Ambient.xyz, 1.0)+clamp(vec4(t_color.xyz, 0.0),vec4(0.0f), vec4(0.0f));

	color = clamp(vec4(t_color.xyz, 0.0),vec4(0.0f), vec4(0.0f));

	//color =  vec4(t_color.x, t_color.y*0.0f, t_color.z*0.0,0.0);  
}
