import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/chat/webhook
 * Receives action requests from n8n AI agent
 * Executes CRUD operations and returns results
 * Acts as n8n "tool" endpoint for function calling
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userAuthToken, userId, todoId, data } = body

    if (!action || !userAuthToken || !userId) {
      console.log('❌ [Chat Webhook] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: action, userAuthToken, userId' },
        { status: 400 }
      )
    }

    console.log('🤖 [Chat Webhook] Processing action:', action)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    let result = { success: false, message: '' }

    try {
      switch (action) {
        case 'create_todo':
          console.log('📝 [Chat Webhook] Creating todo')
          const createRes = await fetch(`${baseUrl}/api/todos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userAuthToken}`,
            },
            body: JSON.stringify({
              title: data?.title || 'Untitled',
              description: data?.description || '',
            }),
          })

          if (createRes.ok) {
            const { data: createdTodo } = await createRes.json()
            result = {
              success: true,
              message: `✅ Created: "${createdTodo.title}"`,
            }
            console.log('✅ [Chat Webhook] Todo created:', createdTodo.id)
          } else {
            result = { success: false, message: '❌ Failed to create todo' }
          }
          break

        case 'update_todo':
          console.log('✏️ [Chat Webhook] Updating todo')
          if (!todoId) {
            result = { success: false, message: '❌ Todo ID required for update' }
            break
          }

          const updateRes = await fetch(`${baseUrl}/api/todos/${todoId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userAuthToken}`,
            },
            body: JSON.stringify(data || {}),
          })

          if (updateRes.ok) {
            result = {
              success: true,
              message: `✅ Updated todo successfully`,
            }
            console.log('✅ [Chat Webhook] Todo updated:', todoId)
          } else {
            result = { success: false, message: '❌ Failed to update todo' }
          }
          break

        case 'delete_todo':
          console.log('🗑️ [Chat Webhook] Deleting todo')
          if (!todoId) {
            result = { success: false, message: '❌ Todo ID required for deletion' }
            break
          }

          const deleteRes = await fetch(`${baseUrl}/api/todos/${todoId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${userAuthToken}`,
            },
          })

          if (deleteRes.ok) {
            result = {
              success: true,
              message: `✅ Deleted todo successfully`,
            }
            console.log('✅ [Chat Webhook] Todo deleted:', todoId)
          } else {
            result = { success: false, message: '❌ Failed to delete todo' }
          }
          break

        case 'toggle_todo':
          console.log('✅ [Chat Webhook] Toggling todo')
          if (!todoId) {
            result = { success: false, message: '❌ Todo ID required for toggle' }
            break
          }

          // Get current todo status
          const getRes = await fetch(`${baseUrl}/api/todos/${todoId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userAuthToken}`,
            },
          })

          if (getRes.ok) {
            const { data: todo } = await getRes.json()
            const newStatus = todo.status === 'done' ? 'open' : 'done'

            const toggleRes = await fetch(`${baseUrl}/api/todos/${todoId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAuthToken}`,
              },
              body: JSON.stringify({ status: newStatus }),
            })

            if (toggleRes.ok) {
              result = {
                success: true,
                message: `✅ Marked as ${newStatus === 'done' ? 'completed' : 'active'}`,
              }
              console.log('✅ [Chat Webhook] Todo toggled:', todoId)
            } else {
              result = { success: false, message: '❌ Failed to toggle todo' }
            }
          } else {
            result = { success: false, message: '❌ Todo not found' }
          }
          break

        default:
          result = { success: false, message: `❌ Unknown action: ${action}` }
      }
    } catch (actionError) {
      console.error('⚠️ [Chat Webhook] Error executing action:', actionError)
      result = { success: false, message: `❌ Error: ${actionError instanceof Error ? actionError.message : 'Unknown error'}` }
    }

    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (error) {
    console.error('❌ [Chat Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
