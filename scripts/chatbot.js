document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('deepseek-toggle-button');
    const chatbotContainer = document.getElementById('deepseek-chatbot-container');
    const chatContent = document.getElementById('deepseek-chat-content');
    const chatInput = document.getElementById('deepseek-chat-input');
    const sendButton = document.getElementById('deepseek-send-button');

    // 初始欢迎消息
    chatContent.innerHTML = '<p style="color: #666; text-align: center;">AI 助手已就绪，可以开始聊天！</p>';

    // 切换显示/隐藏聊天窗口
    toggleButton.addEventListener('click', () => {
        if (chatbotContainer.style.display === 'none' || !chatbotContainer.style.display) {
            chatbotContainer.style.display = 'block';
        } else {
            chatbotContainer.style.display = 'none';
        }
    });

    // 发送消息（调用阿里云百炼API）
    async function sendMessage() {
        const input = chatInput.value.trim();
        if (!input) return;

        // 添加用户消息
        const userMessage = document.createElement('div');
        userMessage.style.textAlign = 'right';
        userMessage.style.marginBottom = '10px';
        userMessage.innerHTML = `<p style="display: inline-block; background: #165DFF; color: white; padding: 8px 12px; border-radius: 12px; max-width: 80%;">${input}</p>`;
        chatContent.appendChild(userMessage);

        // 清空输入框
        chatInput.value = '';

        // 显示AI思考中...
        const thinking = document.createElement('div');
        thinking.style.textAlign = 'left';
        thinking.style.marginBottom = '10px';
        thinking.innerHTML = '<p style="display: inline-block; background: #f1f5f9; color: #333; padding: 8px 12px; border-radius: 12px; max-width: 80%;">思考中...</p>';
        chatContent.appendChild(thinking);

        // 调用阿里云百炼API
        try {
            const response = await fetch("https://bailian.aliyuncs.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "sk-46b24343b9974b51b4602aaabae88a42", // 替换成你的API Key
                    "X-DashScope-Async": "enable" // 如果是异步调用
                },
                body: JSON.stringify({
                    model: "bailian-v1", // 模型名称（根据百炼平台提供的模型）
                    messages: [
                        { role: "system", content: "你是一个智能助手，回答问题要简洁专业。" },
                        { role: "user", content: input }
                    ],
                    temperature: 0.7, // 控制回答的随机性（0~1）
                    max_tokens: 500   // 限制返回内容长度
                })
            });

            const data = await response.json();

            // 移除"思考中..."并显示AI回复
            thinking.remove();
            const aiMessage = document.createElement('div');
            aiMessage.style.textAlign = 'left';
            aiMessage.style.marginBottom = '10px';
            
            // 提取AI回复内容（根据百炼API返回结构调整）
            const aiReply = data.choices?.[0]?.message?.content || "抱歉，我暂时无法回答这个问题。";
            aiMessage.innerHTML = `<p style="display: inline-block; background: #f1f5f9; color: #333; padding: 8px 12px; border-radius: 12px; max-width: 80%;">${aiReply}</p>`;
            chatContent.appendChild(aiMessage);
        } catch (error) {
            console.error("API调用失败:", error);
            thinking.remove();
            const errorMessage = document.createElement('div');
            errorMessage.style.textAlign = 'left';
            errorMessage.style.marginBottom = '10px';
            errorMessage.innerHTML = '<p style="display: inline-block; background: #fee2e2; color: #b91c1c; padding: 8px 12px; border-radius: 12px; max-width: 80%;">请求失败，请检查网络或API配置。</p>';
            chatContent.appendChild(errorMessage);
        }

        // 自动滚动到底部
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    // 点击发送按钮
    sendButton.addEventListener('click', sendMessage);

    // 按回车发送消息
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});