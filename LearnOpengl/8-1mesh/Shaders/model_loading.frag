// Fragment shader:
// ================
#version 330 core
struct Material {
    sampler2D texture_diffuse1;
    sampler2D texture_specular1;
    float shininess;
}; 
/* Note: because we now use a material struct again you want to change your
mesh class to bind all the textures using material.texture_diffuseN instead of
texture_diffuseN. */

struct DirLight {
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  

struct PointLight {
    vec3 position;

    float constant;
    float linear;
    float quadratic;  

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  
#define NR_POINT_LIGHTS 2  

//聚光灯
struct SpotLight {
    vec3 position;
    vec3 direction;
    float cutOff;
    float outerCutOff;
  
    float constant;
    float linear;
    float quadratic;
  
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;       
};

in vec3 fragPosition;
in vec3 Normal;
in vec2 TexCoords;

out vec4 color;

uniform vec3 viewPos;
uniform DirLight dirLight;
uniform PointLight pointLights[NR_POINT_LIGHTS];
uniform SpotLight spotLight;
uniform Material material;

// Function prototypes
vec3 CalcPointLight(PointLight light, Material mat, vec3 normal, vec3 fragPos, vec3 viewDir);

void main()
{
	// 一些属性
	vec3 result;
    vec3 viewDir = normalize(viewPos - fragPosition);
    vec3 norm = normalize(Normal);

    // 第一步，计算平行光照
    //vec3 result = CalcDirLight(dirLight, norm, viewDir);
    // 第二步，计算顶点光照
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], material, norm, fragPosition, viewDir);
    // 第三部，计算 Spot light
    //result += CalcSpotLight(spotLight, norm, FragPos, viewDir);

    color = vec4(result, 1.0f);
}

// 计算定点光在确定位置的光照颜色
vec3 CalcPointLight(PointLight light, Material mat, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);
    // Diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
    // Specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), mat.shininess);
    // Attenuation
    float distance = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    
    // Combine results
    vec3 ambient = light.ambient * vec3(texture(mat.texture_diffuse1, TexCoords));
    vec3 diffuse = light.diffuse * diff * vec3(texture(mat.texture_diffuse1, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(mat.texture_specular1, TexCoords));
    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
}