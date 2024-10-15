import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Token expiration will be handled
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // Here you can add additional validation or fetch user data
    return { userId: payload.sub, username: payload.username };
  }
}
