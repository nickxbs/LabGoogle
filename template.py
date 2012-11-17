import webapp2
import jinja2
import os

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class SimpleTemplate(webapp2.RequestHandler):
    def get(self, template_name):
	template_map = {
            'error/404':     'error/404.html',
            '/':             'templates/index.html',
            '/hangoutapp':   'hangoutapp.html',
            '/gadgetxml':    'gadget.xml'
        }

	mime_type_map = {
            '/gadgetxml':    'application/xml'
        }

        template_values = {
            'hostname':      os.environ['HTTP_HOST'],
            'codelab_host':  'hangouts-codelab.appspot.com'
        }

	if template_name in mime_type_map:
            self.response.headers['Content-Type'] = mime_type_map[template_name]

	if not template_name in template_map:
            self.response.status = 404
            template_name = 'error/404'

        template = jinja_environment.get_template(template_map[template_name])
        self.response.out.write(template.render(template_values))

application = webapp2.WSGIApplication([
        webapp2.Route(r'<template_name:(.*)>', SimpleTemplate),
    ],
    debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
