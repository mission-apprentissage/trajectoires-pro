export class ErrorFetchingJson extends Error {
  data: any;
  status: number;

  constructor(data: any, status: number) {
    super("Error fetching Json");
    this.data = data;
    this.status = status;
  }
}
