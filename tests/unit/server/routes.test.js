import { jest, expect, describe, test, beforeEach } from "@jest/globals";
import config from "../../../server/config.js";
import { handler } from "../../../server/routes.js";
import { Controller } from "../../../server/controller.js";
const {
  pages,
  location,
  constants: { CONTENT_TYPE },
} = config;
import TestUtil from "../_util/testUtil.js";

describe("#Routes - test site for api response", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("my test", () => {
    expect(true).toBeTruthy();
  });

  test("GET / - should redirect to home page", async () => {
    const params = TestUtil.defaultHandlerParams();
    params.request.method = "GET";
    params.request.url = "/";

    await handler(...params.values());
    expect(params.response.writeHead).toBeCalledWith(302, {
      Location: location.home,
    });
  });

  test("Route inexistent", async () => {
    const params = TestUtil.defaultHandlerParams();
    params.request.method = "POST";
    params.request.url = "/";

    await handler(...params.values());
    expect(params.response.writeHead).toBeCalledWith(404);
    expect(params.response.end).toHaveBeenCalled();
  });

  test(`GET /home - should response with ${pages.homeHTML} file stream`, async () => {
    const params = TestUtil.defaultHandlerParams();
    params.request.method = "GET";
    params.request.url = "/home";
    const mockFileStream = TestUtil.generateReadableStream(["data"]);

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      });
    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test(`GET /controller - should response with ${pages.controllerHTML} file stream`, async () => {
    const params = TestUtil.defaultHandlerParams();
    params.request.method = "GET";
    params.request.url = "/controller";
    const mockFileStream = TestUtil.generateReadableStream(["data"]);

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      });
    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(
      pages.controllerHTML
    );
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test(`GET /index.html - should response with file stream`, async () => {
    const params = TestUtil.defaultHandlerParams();
    const fileName = "/index.html";
    params.request.method = "GET";
    params.request.url = fileName;
    const mockFileStream = TestUtil.generateReadableStream(["data"]);
    const expectedType = ".html";

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      });
    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(fileName);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": CONTENT_TYPE[expectedType],
    });
  });

  test(`GET /file.ext - should response with file stream`, async () => {
    const params = TestUtil.defaultHandlerParams();
    const fileName = "/file.ext";
    params.request.method = "GET";
    params.request.url = fileName;
    const mockFileStream = TestUtil.generateReadableStream(["data"]);
    const expectedType = ".ext";

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      });
    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(fileName);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).not.toHaveBeenCalledWith(200, {
      "Content-Type": CONTENT_TYPE[expectedType],
    });
  });

  test(`GET /unknown - given an inexistent route it should response with 404`, async () => {
    const params = TestUtil.defaultHandlerParams();
    params.request.method = "GET";
    params.request.url = "/unknown";

    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(404);
    expect(params.response.end).toHaveBeenCalled();
  });

  describe("excepctions", () => {
    test("given inexistent file it should respond with 404", async () => {
      const params = TestUtil.defaultHandlerParams();
      params.request.method = "GET";
      params.request.url = "/index.png";
      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(
          new Error("Error: ENOENT: no such file or diretory")
        );

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });
    test("given an error it should respond with 500", async () => {
      const params = TestUtil.defaultHandlerParams();
      params.request.method = "GET";
      params.request.url = "/index.png";
      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(new Error("Error:"));

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(500);
      expect(params.response.end).toHaveBeenCalled();
    });
  });
});
