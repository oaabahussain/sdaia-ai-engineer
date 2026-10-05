"""Bounded, synthetic upstream security checks; not an application exploit test."""
import asyncio
import unittest
from starlette.requests import Request
from starlette.endpoints import HTTPEndpoint
from starlette.responses import JSONResponse


def scope(host=b'example.invalid', path='/private', method='GET'):
    return {'type': 'http', 'asgi': {'version': '3.0'}, 'http_version': '1.1',
            'scheme': 'http', 'method': method, 'server': ('example.invalid', 80),
            'client': ('127.0.0.1', 1), 'root_path': '', 'path': path,
            'raw_path': path.encode(), 'query_string': b'', 'headers': [(b'host', host)]}


class FrameworkBoundaryTests(unittest.TestCase):
    def test_normal_url_control(self):
        self.assertEqual(Request(scope()).url.path, '/private')

    def test_invalid_host_slash_cannot_change_path(self):
        self.assertEqual(Request(scope(host=b'example.invalid/public?x=')).url.path, '/private')

    def test_invalid_host_fragment_cannot_hide_path(self):
        self.assertEqual(Request(scope(host=b'example.invalid#fragment')).url.path, '/private')

    def test_invalid_host_question_cannot_hide_path(self):
        self.assertEqual(Request(scope(host=b'example.invalid?query')).url.path, '/private')

    def test_path_without_slash_cannot_change_authority(self):
        try:
            value = Request(scope(path='other.invalid/path')).url
        except ValueError:
            return  # An explicit rejection is also fail-closed.
        self.assertEqual(value.hostname, 'example.invalid')

    def test_unregistered_method_cannot_dispatch_internal_helper(self):
        class Endpoint(HTTPEndpoint):
            async def helper(self, request):
                return JSONResponse({'internal_called': True})
        async def run():
            output = []
            async def receive():
                return {'type': 'http.request', 'body': b'', 'more_body': False}
            async def send(message):
                output.append(message)
            await Endpoint(scope(method='HELPER'), receive, send)
            return output
        messages = asyncio.run(run())
        start = next(m for m in messages if m['type'] == 'http.response.start')
        self.assertEqual(start['status'], 405)


if __name__ == '__main__':
    unittest.main(verbosity=2)
