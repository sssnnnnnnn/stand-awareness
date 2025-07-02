export class DateUtils {
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };
    return date.toLocaleDateString('ja-JP', options);
  }

  static formatShortDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('ja-JP', options);
  }

  static isToday(dateStr: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  }

  static isThisMonth(dateStr: string): boolean {
    const date = new Date(dateStr);
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  static getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  static addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return this.formatDate(date);
  }

  static getMonthName(month: number): string {
    const months = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    return months[month];
  }

  static getWeekdayName(weekday: number): string {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays[weekday];
  }
}