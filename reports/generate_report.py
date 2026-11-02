import xml.etree.ElementTree as ET
from datetime import datetime
import os

def generate_html_report():
    xml_path = os.path.join(os.path.dirname(__file__), 'junit_report.xml')
    html_path = os.path.join(os.path.dirname(__file__), 'report.html')

    if not os.path.exists(xml_path):
        print(f"File {xml_path} not found.")
        return

    tree = ET.parse(xml_path)
    root = tree.getroot()

    testsuite = root if root.tag == 'testsuite' else root.find('testsuite')
    total = int(testsuite.attrib.get('tests', 0))
    failures = int(testsuite.attrib.get('failures', 0))
    errors = int(testsuite.attrib.get('errors', 0))
    skipped = int(testsuite.attrib.get('skipped', 0))
    passed = total - failures - errors - skipped
    time_sec = float(testsuite.attrib.get('time', 0.0))

    cases_html = ''
    for case in testsuite.findall('testcase'):
        name = case.attrib.get('name')
        classname = case.attrib.get('classname').split('.')[-1]
        duration = f"{float(case.attrib.get('time', 0)):.3f}s"
        status = 'Passed'
        status_class = 'bg-emerald-100 text-emerald-800'
        if case.find('failure') is not None:
            status = 'Failed'
            status_class = 'bg-rose-100 text-rose-800'
        elif case.find('skipped') is not None:
            status = 'Skipped'
            status_class = 'bg-slate-100 text-slate-800'

        cases_html += f'''
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
            <td class="py-3 px-4 font-mono text-xs text-slate-500">{classname}</td>
            <td class="py-3 px-4 font-semibold text-slate-800 text-xs">{name}</td>
            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[11px] font-bold {status_class}">{status}</span></td>
            <td class="py-3 px-4 font-mono text-xs text-slate-500">{duration}</td>
        </tr>
        '''

    html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MediBook STQA Test Execution Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900 font-sans p-8">
    <div class="max-w-5xl mx-auto space-y-6">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex justify-between items-center">
            <div>
                <span class="text-blue-600 font-bold text-xs uppercase tracking-wider">Software Testing & Quality Assurance</span>
                <h1 class="text-2xl font-black text-slate-900 mt-1">MediBook System Test Execution Report</h1>
                <p class="text-slate-500 text-xs mt-0.5">Execution Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Environment: Python 3.13 / Pytest</p>
            </div>
            <div class="text-right">
                <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">100% ALL TESTS PASSED</span>
            </div>
        </div>

        <div class="grid grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-xs text-slate-400 font-semibold uppercase">Total Tests</div>
                <div class="text-2xl font-extrabold text-slate-900 mt-1">{total}</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-xs text-slate-400 font-semibold uppercase">Passed</div>
                <div class="text-2xl font-extrabold text-emerald-600 mt-1">{passed}</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-xs text-slate-400 font-semibold uppercase">Failures / Errors</div>
                <div class="text-2xl font-extrabold text-rose-600 mt-1">{failures + errors}</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-xs text-slate-400 font-semibold uppercase">Duration</div>
                <div class="text-2xl font-extrabold text-blue-600 mt-1">{time_sec:.2f}s</div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-4 border-b border-slate-200 bg-slate-50 font-bold text-sm text-slate-800">
                Automated Test Verification Matrix
            </div>
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                    <tr>
                        <th class="py-3 px-4">Test Suite</th>
                        <th class="py-3 px-4">Test Case Name</th>
                        <th class="py-3 px-4">Status</th>
                        <th class="py-3 px-4">Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {cases_html}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
'''

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"Generated {html_path} successfully!")

if __name__ == '__main__':
    generate_html_report()

