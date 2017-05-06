// Fragment shader:
// ================
#version 330 core
struct Material {
    sampler2D texture_diffuse1;
    sampler2D texture_specular1;
	sampler2D emission;
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
#define NR_DIR_LIGHTS 5  

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

//�۹��
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
uniform DirLight dirLight[NR_DIR_LIGHTS];
uniform PointLight pointLights[NR_POINT_LIGHTS];
uniform SpotLight spotLight;
uniform Material material;

// Function prototypes
vec3 CalcDirLight(DirLight light, Material mat, vec3 normal, vec3 viewDir);
vec3 CalcPointLight(PointLight light, Material mat, vec3 normal, vec3 fragPos, vec3 viewDir);
vec3 CalcSpotLight(SpotLight light, Material mat, vec3 normal, vec3 fragPos, vec3 viewDir);

void main()
{
	// һЩ����
	vec3 result;
    vec3 viewDir = normalize(viewPos - fragPosition);
    vec3 norm = normalize(Normal);

    // ��һ��������ƽ�й���
	for(int i = 0; i < NR_DIR_LIGHTS; i++)
        result +=  CalcDirLight(dirLight[i], material, norm, viewDir);
    //result = CalcDirLight(dirLight, material, norm, viewDir);
    // �ڶ��������㶥�����
    //for(int i = 0; i < NR_POINT_LIGHTS; i++)
        //result += CalcPointLight(pointLights[i], material, norm, fragPosition, viewDir);
    // ������������ Spot light
    //result += CalcSpotLight(spotLight, norm, FragPos, viewDir);

   color = vec4(result, 1.0f);
}

vec3 CalcDirLight(DirLight light, Material mat, vec3 normal, vec3 viewDir)
{
    vec3 lightDir = normalize(-light.direction);
    // ����������ǿ��
    float diff = max(dot(normal, lightDir), 0.0);
    // ���㾵�淴��ǿ��
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 128);
    // �ϲ��������շ���
    //vec3 ambient  = light.ambient  * vec3(texture(mat.texture_diffuse1, TexCoords));
    //vec3 diffuse  = light.diffuse  * diff * vec3(texture(mat.texture_diffuse1, TexCoords));
    //vec3 specular = light.specular * spec * vec3(texture(mat.texture_specular1, TexCoords));
	vec3 ambient  = light.ambient  * vec3(0.8196, 0.6039, 0.5843);
    vec3 diffuse  = light.diffuse  * diff * vec3(0.8196, 0.6039, 0.5843);
    vec3 specular = light.specular * spec * vec3(0.5882, 0.5882, 0.5882);
    return (ambient + diffuse + specular);
} 

// ���㶨�����ȷ��λ�õĹ�����ɫ
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

// Calculates the color when using a spot light.
vec3 CalcSpotLight(SpotLight light, Material mat, vec3 normal, vec3 fragPos, vec3 viewDir)
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
    // Spotlight intensity
    float theta = dot(lightDir, normalize(-light.direction)); 
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);
    // Combine results
    vec3 ambient = light.ambient * vec3(texture(mat.texture_diffuse1, TexCoords));
    vec3 diffuse = light.diffuse * diff * vec3(texture(mat.texture_diffuse1, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(mat.texture_specular1, TexCoords));
    ambient *= attenuation * intensity;
    diffuse *= attenuation * intensity;
    specular *= attenuation * intensity;
    return (ambient + diffuse + specular);
}