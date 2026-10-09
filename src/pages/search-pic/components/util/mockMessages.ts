import { Message } from "../nowChatHistory";

export const mockMessages: Message[] = [
    {
        role: "user",
        content: "请帮我展示一下 Markdown 渲染效果",
    },
    {
        role: "bot",
        content: `这是一个 Markdown 示例：

# Title 1
## Title 2 
**有序列表** 这句话没加粗
1. 第一项
2. 第二项
3. 第三项

**无序列表**
- 苹果
- 香蕉
- 樱桃

**表格**
| 姓名   | 年龄 | 城市   |
| ------ | ---- | ------ |
| 小明   | 25   | 北京   |
| 小红   | 22   | 上海   |
| 小刚   | 30   | 广州   |

**链接**
[OpenAI 官网](https://openai.com)
### 三级标题
**图片示例**  
#### 以下是搜索结果
![截图](http://localhost:3000/api/video/screenshot?image_path=NVR_ch32_main_20250326000000_20250326010015/fullImage/images/1400/1400.png)
![截图](http://localhost:3000/api/video/screenshot?image_path=NVR_ch32_main_20250326000000_20250326010015/fullImage/images/1400/1400.png)
![截图](http://localhost:3000/api/video/screenshot?image_path=NVR_ch32_main_20250326000000_20250326010015/fullImage/images/1400/1400.png)
![截图](http://localhost:3000/api/video/screenshot?image_path=NVR_ch32_main_20250326000000_20250326010015/fullImage/images/1400/1400.png)
![截图](http://localhost:3000/api/video/screenshot?image_path=NVR_ch32_main_20250326000000_20250326010015/fullImage/images/1400/1400.png)
![截图](http://localhost:3000/api/video/screenshot?image_path=NVR_ch32_main_20250326000000_20250326010015/fullImage/images/1400/1400.png)
![截图](http://localhost:3000/api/video/screenshot?image_path=NVR_ch32_main_20250326000000_20250326010015/fullImage/images/1400/1400.png)
![截图](http://localhost:3000/api/video/screenshot?image_path=NVR_ch32_main_20250326000000_20250326010015/fullImage/images/1400/1400.png)
![截图](http://localhost:3000/api/video/screenshot?image_path=NVR_ch32_main_20250326000000_20250326010015/fullImage/images/1400/1400.png)
![截图](http://localhost:3000/api/video/screenshot?image_path=NVR_ch32_main_20250326000000_20250326010015/fullImage/images/1400/1400.png)
**链接**
[OpenAI 官网](https://openai.com)\n
这是一段文字
`,
    },
];
