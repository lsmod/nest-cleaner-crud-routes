import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `<h1>Hello try hitting :</h2>
      <ul>
        <li>
          GET /users<br>
        </li>
        <li>
          POST /users
        </li>
        <li>
          PUT /users/:id
        </li>
      </ul>
    `;
  }
}
