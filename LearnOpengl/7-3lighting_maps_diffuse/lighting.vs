#version 330 core
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoords;

out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(position, 1.0f);
	FragPos = vec3(model * vec4(position, 1.0f));//我们可以通过把顶点位置属性乘以模型矩阵(Model Matrix,只用模型矩阵不需要用观察和投影矩阵)来把它变换到世界空间坐标
	Normal = mat3(transpose(inverse(model))) * normal;
	TexCoords = texCoords;
}