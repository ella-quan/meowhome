
import { Language } from '../types';

export const translations = {
  en: {
    nav: {
      home: "Home",
      calendar: "Calendar",
      tasks: "Tasks",
      gallery: "Gallery"
    },
    dashboard: {
      greeting: {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening"
      },
      subtitle: "Here's what's happening today.",
      todayEvents: "Events Today",
      noEventsToday: "Nothing scheduled for today.",
      allCaughtUp: "All caught up!",
      viewAll: "View all",
      memories: "Memories",
      noPhotos: "No photos yet. Share a memory!",
      familyMembers: "Family Members"
    },
    calendar: {
      noEvents: "No events scheduled.",
      allDay: "All Day",
      views: {
        month: "Month",
        week: "Week"
      },
      addEvent: "Add Event",
      editEvent: "Edit Event",
      form: {
        title: "Title",
        location: "Location",
        starts: "Starts",
        ends: "Ends",
        allDay: "All Day",
        type: "Type",
        notes: "Notes",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        confirmDelete: "Delete this event?",
        types: {
          appointment: "Appointment",
          activity: "Activity",
          celebration: "Celebration",
          general: "General"
        }
      }
    },
    tasks: {
      title: "Family Tasks",
      assignTo: "Assign to",
      unassigned: "Unassigned",
      filter: {
        all: "All",
        active: "Active",
        completed: "Done"
      },
      empty: "No tasks found. Time to relax!",
      priority: {
        low: "Low",
        medium: "Medium",
        high: "High"
      }
    },
    gallery: {
      title: "Family Album",
      upload: "Upload Photo",
      addPhoto: "Add Photo",
      deleteConfirm: "Delete this photo?",
      promptCaption: "Add a caption for this photo:"
    },
    magic: {
      button: "Magic Add",
      title: "Magic Assistant",
      placeholder: "What needs to be done? (e.g., 'Soccer at 5pm')",
      hint: "Try 'Soccer practice on Tuesday at 5pm' or 'Buy milk high priority for Dad'",
      processing: "Thinking...",
      error: "Sorry, I had trouble processing that. Try being more specific."
    }
  },
  zh: {
    nav: {
      home: "首页",
      calendar: "日历",
      tasks: "待办",
      gallery: "相册"
    },
    dashboard: {
      greeting: {
        morning: "早上好",
        afternoon: "下午好",
        evening: "晚上好"
      },
      subtitle: "今天家庭动态如下。",
      todayEvents: "今日事项",
      noEventsToday: "今天没有安排。",
      allCaughtUp: "任务都完成了！",
      viewAll: "查看全部",
      memories: "珍贵回忆",
      noPhotos: "暂无照片。分享一个美好瞬间吧！",
      familyMembers: "家庭成员"
    },
    calendar: {
      noEvents: "暂无日程安排。",
      allDay: "全天",
      views: {
        month: "月视图",
        week: "周视图"
      },
      addEvent: "添加日程",
      editEvent: "编辑日程",
      form: {
        title: "标题",
        location: "地点",
        starts: "开始",
        ends: "结束",
        allDay: "全天",
        type: "类型",
        notes: "备注",
        cancel: "取消",
        save: "保存",
        delete: "删除",
        confirmDelete: "确定删除此日程吗？",
        types: {
          appointment: "预约",
          activity: "活动",
          celebration: "庆典",
          general: "一般"
        }
      }
    },
    tasks: {
      title: "家庭待办",
      assignTo: "分配给",
      unassigned: "未分配",
      filter: {
        all: "全部",
        active: "进行中",
        completed: "已完成"
      },
      empty: "没有任务。休息一下吧！",
      priority: {
        low: "低",
        medium: "中",
        high: "高"
      }
    },
    gallery: {
      title: "家庭相册",
      upload: "上传照片",
      addPhoto: "添加照片",
      deleteConfirm: "确定要删除这张照片吗？",
      promptCaption: "为这张照片添加说明："
    },
    magic: {
      button: "智能添加",
      title: "智能助手",
      placeholder: "要做什么？(例如：'周五晚上聚餐')",
      hint: "试着输入 '周二下午5点踢足球' 或 '买牛奶 高优先级 给爸爸'",
      processing: "思考中...",
      error: "抱歉，我没听懂。请尝试说得更具体一点。"
    }
  }
};

export type Translation = typeof translations.en;
