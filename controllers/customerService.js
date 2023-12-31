import OpenAI from 'openai'
import * as restaurantModel from '../models/restaurant.js'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const chatBot = async (req, res) => {
  try {
    if (process.env.SERVER_STATUS === 'development') {
      return res.status(200).json({ message: '抱歉，目前處於開發階段，不開放客服機器人。' })
    }

    const { userInput } = req.body
    const { restaurantId } = req.params
    const restaurantInfo = await restaurantModel.getRestaurant(restaurantId)
    const messages = [
      {
        role: 'system',
        content: JSON.stringify(restaurantInfo)
      },
      {
        role: 'system',
        content: `你的設定是一個餐廳客服機器人, 我稍早提供的資訊是關於這間餐廳的資訊,
          請幫我依照那個資料回答 user 的問題, 請用一句話回答`
      },
      {
        role: 'user',
        content: userInput
      }
    ]
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages
    })

    res.status(200).json({ message: response.choices[0].message.content })
  } catch (err) {
    console.error(err.stack)
    if (err instanceof Error) {
      return res.status(400).json({ errors: err.message })
    }
    res.status(500).json({ errors: 'Chat bot failed' })
  }
}

export default chatBot
