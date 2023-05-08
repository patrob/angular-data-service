import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const baseUrl = 'https://jsonplaceholder.typicode.com/posts';

@Injectable({
  providedIn: 'root',
})
class TestGivenUrlDataService extends DataService<{ id: number }> {
  constructor(http: HttpClient) {
    super(http, baseUrl);
  }
}

@Injectable({
  providedIn: 'root',
})
class TestLocalhostDataService extends DataService<{ id: number }> {
  constructor(http: HttpClient) {
    super(http);
  }
}

describe('DataService', () => {
  let service: DataService<{ id: number }>;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TestGivenUrlDataService, TestLocalhostDataService],
    });
    service = TestBed.inject(TestGivenUrlDataService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadData', () => {
    it('should load data', () => {
      const testObject = [{ id: 1 }];
      expect(service.loading()).toEqual(false);
      service.loadData();
      const req = http.expectOne(baseUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(testObject);
      expect(service.data()).toEqual(testObject);
      expect(service.error()).toBeUndefined();
    });

    it('should handle error', () => {
      service = TestBed.inject(TestLocalhostDataService);
      expect(service.loading()).toEqual(false);
      service.loadData();
      const req = http.expectOne('http://localhost');
      expect(req.request.method).toEqual('GET');
      req.flush([], { status: 500, statusText: 'Not Found' });
      expect(service.data()).toBeUndefined();
      expect(service.error()).toContain('Not Found');
    });
  });

  describe('loadDataWithId', () => {
    it('should load data with relative url', () => {
      const testObject = { id: 1 };
      expect(service.loading()).toEqual(false);
      service.loadDataWithId(1);
      const req = http.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toEqual('GET');
      req.flush(testObject);
      expect(service.data()).toEqual(testObject);
    });
  });

  describe('create', () => {
    it('should call http.post with payload', () => {
      const testObject = { id: 1 };
      expect(service.loading()).toEqual(false);
      service.create(testObject);
      const req = http.expectOne(baseUrl);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(testObject);
      req.flush({});
    });

    it('should call reload after post', () => {
      const testObject = { id: 1 };
      expect(service.loading()).toEqual(false);
      service.create(testObject);
      const req = http.expectOne(
        (req) => req.url === baseUrl && req.method === 'POST'
      );
      expect(req.request.body).toEqual(testObject);
      req.flush({});
      const req2 = http.expectOne(
        (req) => req.url === baseUrl && req.method === 'GET'
      );
      req2.flush([testObject]);
      expect(service.data()).toEqual([testObject]);
      http.verify();
    });

    it('should handle error', () => {
      const testObject = { id: 1 };
      expect(service.loading()).toEqual(false);
      service.create(testObject);
      const req = http.expectOne(
        (req) => req.url === baseUrl && req.method === 'POST'
      );
      req.flush({}, { status: 500, statusText: 'Not Found' });
      expect(service.data()).toBeUndefined();
      expect(service.error()).toContain('Not Found');
    });
  });

  describe('update', () => {
    it('should call http.put with payload', () => {
      const testObject = { id: 1 };
      expect(service.loading()).toEqual(false);
      service.update(testObject);
      const req = http.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual(testObject);
      req.flush({});
    });

    it('should call reload after put', () => {
      const testObject = { id: 1 };
      expect(service.loading()).toEqual(false);
      service.update(testObject);
      const req = http.expectOne(
        (req) => req.url === `${baseUrl}/1` && req.method === 'PUT'
      );
      expect(req.request.body).toEqual(testObject);
      req.flush({});
      const req2 = http.expectOne(
        (req) => req.url === baseUrl && req.method === 'GET'
      );
      req2.flush([testObject]);
      expect(service.data()).toEqual([testObject]);
      http.verify();
    });

    it('should handle error when id is zero', () => {
      const testObject = { id: 0 };
      expect(service.loading()).toEqual(false);
      service.update(testObject);
      http.expectNone(
        (req) =>
          req.url === `${baseUrl}/${testObject.id}` && req.method === 'PUT'
      );
      expect(service.data()).toBeUndefined();
      expect(service.error()).toContain('Id must be greater than 0');
    });

    it('should handle error', () => {
      const testObject = { id: 1 };
      expect(service.loading()).toEqual(false);
      service.update(testObject);
      const req = http.expectOne(
        (req) => req.url === `${baseUrl}/1` && req.method === 'PUT'
      );
      req.flush({}, { status: 500, statusText: 'Not Found' });
      expect(service.data()).toBeUndefined();
      expect(service.error()).toContain('Not Found');
    });
  });

  describe('delete', () => {
    it('should call http.delete with payload', () => {
      const testId = 1;
      expect(service.loading()).toEqual(false);
      service.delete(testId);
      const req = http.expectOne(`${baseUrl}/${testId}`);
      expect(req.request.method).toEqual('DELETE');
      req.flush({});
    });

    it('should call reload after post', () => {
      const testId = 1;
      expect(service.loading()).toEqual(false);
      service.delete(testId);
      const req = http.expectOne(
        (req) => req.url === `${baseUrl}/${testId}` && req.method === 'DELETE'
      );
      req.flush({});
      const req2 = http.expectOne(
        (req) => req.url === baseUrl && req.method === 'GET'
      );
      req2.flush([]);
      expect(service.data()).toEqual([]);
      http.verify();
    });

    it('should handle error when id is zero', () => {
      const testId = 0;
      expect(service.loading()).toEqual(false);
      service.delete(testId);
      http.expectNone(
        (req) => req.url === `${baseUrl}/${testId}` && req.method === 'DELETE'
      );
      expect(service.data()).toBeUndefined();
      expect(service.error()).toContain('Id must be greater than 0');
    });

    it('should handle error', () => {
      const testId = 1;
      expect(service.loading()).toEqual(false);
      service.delete(testId);
      const req = http.expectOne(
        (req) => req.url === `${baseUrl}/1` && req.method === 'DELETE'
      );
      req.flush({}, { status: 500, statusText: 'Not Found' });
      expect(service.data()).toBeUndefined();
      expect(service.error()).toContain('Not Found');
    });
  });
});
