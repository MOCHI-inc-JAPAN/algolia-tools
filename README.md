```
import admin from 'firebase-admin';
import moment from 'moment';
import {
  AlgoliaFirebaseManager,
} from '../util';

const initialState: UserSearchRecord = {
  },
  belongsTo: '',
  birthDay: admin.firestore.FieldValue.serverTimestamp(),
  firstName: '',
  firstNamePhonetic: '',
  gender: 0,
  graduations: [],
  id: '',
  image: '',
  income: 0,
  jobType: 0,
  lastName: '',
  lastNamePhonetic: '',
  objectID: '',
  motivation: 0,
  status: '',
  searchWords: '',
  skillTags: [],
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

export default class UserIndexManager implements IndexManager {
  private algoliaManager: AlgoliaFirebaseManager;
  public constructor(args: { algoliaManager: AlgoliaFirebaseManager }) {
    this.algoliaManager = args.algoliaManager;
  }

  private filter = (userBase: UserSchema): UserSearchRecord => {
    const user = {
      ...initialState,
      ...userBase
    };
    return {
      address: user.address,
      belongsTo: user.belongsTo,
      firstName: user.firstName,
      firstNamePhonetic: user.firstNamePhonetic,
      lastName: user.lastName,
      lastNamePhonetic: user.lastNamePhonetic,
      status: UserStatus[user.status],
      birthDay: (user.birthDay as FirestoreTimestamp).toDate
        ? user.birthDay
        : user.birthDay &&
          admin.firestore.Timestamp.fromDate(
            moment(user.birthDay as Date, 'YYYYY年MM月DD').toDate()
          ),
      gender: user.gender,
      graduations: user.graduations.map(v => v.schoolName),
      id: user.id,
      image: user.image,
      income: user.income,
      jobType: user.jobType,
      motivation: user.motivation,
      objectID: user.id,
      updatedAt: user.updatedAt,
      skillTags: extractTags(user.episodes),
      searchWords: extractSearchWords(user.episodes)
    };
  };

  public sendIndex = async (userId: string, user: UserSchema) => {
    const indexData = {
      ...user,
      objectID: userId
    };
    const result = await this.algoliaManager.sendIndex(
      'users',
      this.filter(indexData)
    );
    if (result) {
      console.log(`users index has been updated: [userId:${user.id}]`);
      return true;
    } else {
      console.error('users index update has been failed');
      return false;
    }
  };

  public batchSendToIndex = async () => {
    const result = await this.algoliaManager.batchSendDataToIndex(
      {
        index: 'users',
        collection: admin.firestore().collection('users')
      },
      this.filter
    );
    return result;
  };

  public deleteIndexData = async (userIds: string[]) => {
    const result = await this.algoliaManager.deleteIndexData('users', userIds);
    if (result) {
      console.log(`user index has been deleted: [userIds:${userIds}]`);
      return true;
    } else {
      console.error('user index delete has been failed');
      return false;
    }
  };
}
```
