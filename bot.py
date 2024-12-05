import os
import logging
from datetime import datetime
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from supabase import create_client, Client

# ... keep existing code (logging configuration and Supabase setup)

async def help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """显示帮助信息"""
    help_text = """
可用命令列表:
/add - 添加新记录
格式: /add 类型 账号 积分 单价 用户名 状态
例如: /add sm积分 test123 100 0.1 张三 未结款

/update - 更新记录状态
格式: /update 记录ID 新状态
例如: /update 1 已结款

/ls - 查看最近记录
格式: /ls [数量]
例如: /ls 5 (显示最近5条记录)

/search - 搜索记录
格式: /search 关键词
例如: /search 张三
    """
    await update.message.reply_text(help_text)

async def add(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """添加新记录"""
    try:
        # 解析命令参数
        args = context.args
        if len(args) < 6:
            await update.message.reply_text("参数不足!\n格式: /add 类型 账号 积分 单价 用户名 状态")
            return

        type = args[0]
        account = args[1]
        points = float(args[2])
        unit_price = float(args[3])
        username = args[4]
        status = args[5]

        # 计算总金额
        total_amount = points * unit_price

        # 插入记录
        data = {
            "type": type,
            "account": account,
            "points": points,
            "unit_price": unit_price,
            "total_amount": total_amount,
            "username": username,
            "status": status,
            "date": datetime.now().isoformat()
        }

        result = supabase.table('transactions').insert(data).execute()
        
        if result.data:
            response = f"""
添加记录成功!
类型: {type}
账号: {account}
积分: {points}
单价: {unit_price}
总额: ¥{total_amount:.2f}
用户: {username}
状态: {status}
            """
            await update.message.reply_text(response)
        else:
            await update.message.reply_text("添加记录失败!")

    except Exception as e:
        await update.message.reply_text(f"发生错误: {str(e)}")

async def update_status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """更新记录状态"""
    try:
        args = context.args
        if len(args) < 2:
            await update.message.reply_text("参数不足!\n格式: /update 记录ID 新状态")
            return

        record_id = int(args[0])
        new_status = args[1]

        result = supabase.table('transactions').update(
            {"status": new_status}
        ).eq("id", record_id).execute()

        if result.data:
            await update.message.reply_text(f"记录 {record_id} 状态已更新为: {new_status}")
        else:
            await update.message.reply_text("更新失败!")

    except Exception as e:
        await update.message.reply_text(f"发生错误: {str(e)}")

async def ls(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """查看记录列表"""
    try:
        limit = 10  # 默认显示10条
        if context.args and context.args[0].isdigit():
            limit = int(context.args[0])

        data = supabase.table('transactions') \
            .select('*') \
            .order('created_at', desc=True) \
            .limit(limit) \
            .execute()

        if not data.data:
            await update.message.reply_text("没有找到任何记录!")
            return

        response = f"最近的{limit}条记录:\n\n"
        for record in data.data:
            response += f"ID: {record['id']}\n"
            response += f"类型: {record['type']}\n"
            response += f"账号: {record['account']}\n"
            response += f"积分: {record['points']}\n"
            response += f"单价: {record['unit_price']}\n"
            response += f"总额: ¥{record['total_amount']:.2f}\n"
            response += f"用户: {record['username']}\n"
            response += f"状态: {record['status']}\n"
            response += f"时间: {record['date']}\n"
            response += "-------------------\n"

        await update.message.reply_text(response)

    except Exception as e:
        await update.message.reply_text(f"发生错误: {str(e)}")

async def search(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """搜索记录"""
    try:
        if not context.args:
            await update.message.reply_text("请提供搜索关键词!\n格式: /search 关键词")
            return

        keyword = context.args[0]

        data = supabase.table('transactions') \
            .select('*') \
            .or_(f"account.ilike.%{keyword}%,username.ilike.%{keyword}%,type.ilike.%{keyword}%") \
            .execute()

        if not data.data:
            await update.message.reply_text(f"没有找到包含 '{keyword}' 的记录!")
            return

        response = f"搜索结果 '{keyword}':\n\n"
        for record in data.data:
            response += f"ID: {record['id']}\n"
            response += f"类型: {record['type']}\n"
            response += f"账号: {record['account']}\n"
            response += f"积分: {record['points']}\n"
            response += f"单价: {record['unit_price']}\n"
            response += f"总额: ¥{record['total_amount']:.2f}\n"
            response += f"用户: {record['username']}\n"
            response += f"状态: {record['status']}\n"
            response += f"时间: {record['date']}\n"
            response += "-------------------\n"

        await update.message.reply_text(response)

    except Exception as e:
        await update.message.reply_text(f"发生错误: {str(e)}")

def main() -> None:
    """启动机器人"""
    # 创建应用
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # 添加命令处理器
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help))
    application.add_handler(CommandHandler("add", add))
    application.add_handler(CommandHandler("update", update_status))
    application.add_handler(CommandHandler("ls", ls))
    application.add_handler(CommandHandler("search", search))

    # 启动机器人
    application.run_polling()

if __name__ == '__main__':
    main()